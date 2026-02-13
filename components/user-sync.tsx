"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

/**
 * UserSync component ensures the Clerk user is synced to Convex database.
 * This is a fallback in case the Clerk webhook hasn't fired yet.
 */
export function UserSync() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const hasAttemptedSync = useRef(false);

  useEffect(() => {
    // Wait for both Clerk and Convex to load
    if (!isLoaded || !user) return;
    
    // If we're still loading the current user from Convex, wait
    if (currentUser === undefined) return;

    // If currentUser is null, user doesn't exist in Convex yet - create them
    if (currentUser === null && !hasAttemptedSync.current) {
      hasAttemptedSync.current = true;
      
      console.log("Creating user in Convex:", user.id);
      
      getOrCreateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl,
      })
        .then(() => {
          console.log("User created successfully");
        })
        .catch((error) => {
          console.error("Failed to sync user:", error);
          // Reset so we can try again
          hasAttemptedSync.current = false;
        });
    }
  }, [isLoaded, user, currentUser, getOrCreateUser]);

  // This component doesn't render anything
  return null;
}
