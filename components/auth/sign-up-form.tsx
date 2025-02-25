'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth, useFirestore } from "reactfire";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ROLES, UserRole, DEFAULT_ROLE } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'manager', 'staff']).default('staff'),
});

interface SignUpFormProps {
  onShowLogin: () => void;
  onSignUp?: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ onShowLogin, onSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: DEFAULT_ROLE,
    },
  });

  const signup = async ({ email, password, role }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential?.user) {
        // Create user document in Firestore
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: role,
          subscriptionTier: "core",
          createdAt: serverTimestamp()
        });
        
        toast({ title: "Account created!" });
        onSignUp?.();
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        toast({ title: "User already exists" });
      } else {
        toast({ 
          title: "Error signing up", 
          description: err.message || "An unexpected error occurred"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(signup)} className="space-y-4">
          <fieldset disabled={isLoading}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ROLES.STAFF}>Staff</SelectItem>
                      <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                      <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your role in the organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Sign Up</Button>
          </fieldset>
        </form>
      </Form>

      <p className="mt-4 text-sm">
        Already joined?{" "}
        <Button variant="link" onClick={onShowLogin}>
          Sign in instead.
        </Button>
      </p>
    </>
  );
};
