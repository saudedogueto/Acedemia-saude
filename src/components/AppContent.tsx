"use client";

import { useAuth } from "@/contexts/AuthContext";
import NavBar from "./NavBar";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  return (
    <>
      {children}
      {!loading && user && <NavBar />}
    </>
  );
}
