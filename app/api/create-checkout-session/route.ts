import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const { planId, userId, isAnnual } = await request.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Missing planId or userId" },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Don't create checkout sessions for the free plan
    if (planId === 'core') {
      return NextResponse.json(
        { error: "Cannot create checkout session for free plan" },
        { status: 400 }
      );
    }

    const priceId = isAnnual ? plan.stripePriceId.annual : plan.stripePriceId.monthly;
    
    if (!priceId) {
      return NextResponse.json(
        { error: "No price ID found for selected plan and billing period" },
        { status: 400 }
      );
    }

    console.log('Creating checkout session with:', {
      userId,
      planId,
      priceId,
      isAnnual
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?canceled=true`,
      metadata: {
        userId,
        planId
      },
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      }
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      metadata: session.metadata
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
