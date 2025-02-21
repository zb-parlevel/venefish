import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin if not already initialized
    initAdmin();
    const db = getFirestore();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session);
      
      // Log metadata
      console.log('Session metadata:', session.metadata);
      
      if (!session.metadata?.userId || !session.metadata?.planId) {
        console.error('Missing userId or planId in session metadata');
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      const { userId, planId } = session.metadata;

      try {
        // Update user's subscription in Firestore
        const userRef = db.collection('users').doc(userId);
        
        const updateData = {
          subscriptionTier: planId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: new Date().toISOString()
        };
        
        console.log(`Updating user ${userId} with data:`, updateData);
        
        await userRef.set(updateData, { merge: true });
        console.log(`Successfully updated subscription for user ${userId} to ${planId}`);
      } catch (error) {
        console.error('Error updating Firestore:', error);
        return NextResponse.json(
          { error: 'Failed to update user subscription' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
