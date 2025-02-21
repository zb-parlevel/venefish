"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useFirestoreDocData } from "reactfire";
import { doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SubscriptionStatus = () => {
  const { data: user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = user ? doc(firestore, "users", user.uid) : null;
  const { data: userData, status } = useFirestoreDocData(userDocRef!, {
    idField: "id",
    initialData: {
      subscriptionTier: "loading"
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return "bg-purple-500 hover:bg-purple-600";
      case "premium":
        return "bg-blue-500 hover:bg-blue-600";
      case "loading":
        return "bg-gray-400 hover:bg-gray-500";
      default:
        return "bg-green-500 hover:bg-green-600";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Plan</p>
            <Badge className={getTierColor(userData.subscriptionTier)}>
              {status === "loading" ? "Loading..." : userData.subscriptionTier?.charAt(0).toUpperCase() + userData.subscriptionTier?.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
