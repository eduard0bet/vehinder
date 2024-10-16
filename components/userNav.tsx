"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function UserNav() {
  const { isLoggedIn, role } = useAuth();

  useEffect(() => {
    const handleAuthChange = () => {
      // Re-trigger a re-render by using the auth context directly
      // Context should already handle the state changes, so we rely on it
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  return (
    <div className="flex justify-between gap-1">
      {isLoggedIn ? (
        <>
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="w-full">
              Dashboard
            </Button>
          </Link>
          <LogoutButton />
        </>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.location.href = "/auth/login"}
          className="w-full"
        >
          Login
        </Button>
      )}
    </div>
  );
}
