"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";

/**
 * PublicRoute component ensures that only unauthenticated users can access the route.
 * If a user is authenticated, they are redirected to the homepage.
 */
const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle redirect for authenticated users
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Show nothing while loading to prevent flash of content
  if (loading) {
    return <></>;
  }

  // Render children for unauthenticated users
  return user ? <></> : <>{children}</>;
};

export default PublicRoute;
