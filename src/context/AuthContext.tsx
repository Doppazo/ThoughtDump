"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signInDemoUser: () => void;
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  uid: "demo-student-42",
  displayName: "Alex Rivera (Demo Student)",
  email: "alex@bentley.edu",
  isDemo: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // If Firebase isn't configured, check local storage for demo session
      const stored = localStorage.getItem("thinkbox_demo_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(DEMO_USER);
        }
      } else {
        // Default to demo user so app is immediately usable for testing
        setUser(DEMO_USER);
        localStorage.setItem("thinkbox_demo_user", JSON.stringify(DEMO_USER));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Student",
          photoURL: fbUser.photoURL,
          isDemo: false,
        });
      } else {
        // Check if demo user is active
        const stored = localStorage.getItem("thinkbox_demo_user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Fallback demo login
      setUser(DEMO_USER);
      localStorage.setItem("thinkbox_demo_user", JSON.stringify(DEMO_USER));
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      const demoAccount: AuthUser = {
        uid: "demo-" + email.replace(/[^a-zA-Z0-9]/g, ""),
        displayName: email.split("@")[0],
        email,
        isDemo: true,
      };
      setUser(demoAccount);
      localStorage.setItem("thinkbox_demo_user", JSON.stringify(demoAccount));
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      const demoAccount: AuthUser = {
        uid: "demo-" + email.replace(/[^a-zA-Z0-9]/g, ""),
        displayName: email.split("@")[0],
        email,
        isDemo: true,
      };
      setUser(demoAccount);
      localStorage.setItem("thinkbox_demo_user", JSON.stringify(demoAccount));
      return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInDemoUser = () => {
    setUser(DEMO_USER);
    localStorage.setItem("thinkbox_demo_user", JSON.stringify(DEMO_USER));
  };

  const signOut = async () => {
    localStorage.removeItem("thinkbox_demo_user");
    if (auth && isFirebaseConfigured) {
      await fbSignOut(auth);
    }
    setUser(null);
  };

  const getToken = async (): Promise<string> => {
    if (user?.isDemo) {
      return `demo-token-${user.uid}`;
    }
    if (auth?.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    if (user) {
      return `demo-token-${user.uid}`;
    }
    return "demo-token-guest";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInDemoUser,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
