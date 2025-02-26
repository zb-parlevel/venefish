"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useUser } from "reactfire";
import { useFirestore, useFirestoreDocData } from "reactfire";
import { doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const NavbarUserLinks: FC = () => {
  const { data: user, hasEmitted } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const firestore = useFirestore();

  // Create ref only if we have a user
  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  
  // Only subscribe to Firestore if we have a valid reference
  const { data: userData } = useFirestoreDocData(userDocRef!, {
    idField: 'id',
    suspense: false,
  });

  useEffect(() => {
    // Reset admin status when user changes
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Check if user data exists and has admin role
    if (userData) {
      console.log("User Firestore data:", userData);
      setIsAdmin(userData.role === 'admin');
    }
  }, [user, userData]);

  return (
    <>
      {hasEmitted && user ? (
        <>
          <Link href="/app" className={buttonVariants()}>
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className={buttonVariants({ variant: "outline" })}>
              User Management
            </Link>
          )}
          <UserNav />
        </>
      ) : (
        <>
          <Link href="/login" className={buttonVariants()}>
            Login / Register &rarr;
          </Link>
        </>
      )}
    </>
  );
};
