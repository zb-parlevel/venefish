"use client";

import { useUser, useFirestore, useFirestoreDocData } from 'reactfire';
import { doc, setDoc } from 'firebase/firestore';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SubscriptionStatus() {
  const { data: user, status: authStatus } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  // Always create a reference, even if it's to a placeholder doc
  const userDocRef = user ? doc(firestore, "users", user.uid) : doc(firestore, "_placeholder", "user");
  const { data: userData, error: firestoreError, status: firestoreStatus } = useFirestoreDocData(userDocRef, {
    idField: "id",
    initialData: {
      subscriptionTier: "none"
    }
  });

  // Show loading state
  if (authStatus === 'loading' || firestoreStatus === 'loading') {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Loading subscription information...</p>
        </CardContent>
      </Card>
    );
  }

  // Show sign in prompt
  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Please sign in to view subscription status.</p>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (firestoreError) {
    console.error('Firestore error:', firestoreError);
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-red-500">
            Error loading subscription data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleUpgrade = async (planId: keyof typeof SUBSCRIPTION_PLANS) => {
    try {
      setError(null);
      setIsLoading(true);

      // Don't create a checkout session for the free plan
      if (planId === 'core') {
        await setDoc(doc(firestore, "users", user.uid), {
          subscriptionTier: 'core',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.uid,
          isAnnual,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process upgrade');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlanId = userData.subscriptionTier as keyof typeof SUBSCRIPTION_PLANS;
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId] || { name: "No Plan", price: 0, features: [] };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h2 className="text-xl font-bold">PAR level Subscription</h2>
          <div className="flex items-center gap-2 mt-2">
            <span>Current Plan:</span>
            <Badge variant="default" className="capitalize">
              {currentPlan.name}
            </Badge>
            <span className="text-muted-foreground">
              ${isAnnual ? currentPlan.annualPrice : currentPlan.monthlyPrice}/mo
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="billing-period">Monthly</Label>
          <Switch
            id="billing-period"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-period">Annual (Save up to 20%)</Label>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <Card key={planId} className={`p-6 ${planId === currentPlanId ? 'border-primary' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mt-2">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">
                        ${isAnnual ? plan.annualTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : plan.monthlyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-muted-foreground ml-1">{isAnnual ? '/year' : '/month'}</span>
                    </div>
                    {isAnnual && plan.annualPrice > 0 && (
                      <div className="text-sm text-muted-foreground">
                        (${plan.annualPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per month)
                      </div>
                    )}
                    {!isAnnual && plan.annualPrice < plan.monthlyPrice && (
                      <div className="text-sm text-emerald-600">
                        Save ${((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} yearly with annual billing
                      </div>
                    )}
                  </div>
                </div>
                {planId === 'premium' && (
                  <Badge className="bg-primary">POPULAR</Badge>
                )}
              </div>
              
              <div className="mt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => {
                    const isHeader = feature.includes('including:');
                    return (
                      <li key={index} className={`flex items-start gap-2 ${isHeader ? 'mt-4' : ''}`}>
                        {!isHeader && (
                          <svg
                            className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                        <span className={isHeader ? 'font-semibold text-sm text-muted-foreground uppercase tracking-wider' : ''}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {planId !== currentPlanId && (
                <Button
                  onClick={() => handleUpgrade(planId as keyof typeof SUBSCRIPTION_PLANS)}
                  disabled={isLoading}
                  className="w-full mt-6"
                  variant={planId === 'premium' ? 'default' : 'outline'}
                >
                  {isLoading ? 'Loading...' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
