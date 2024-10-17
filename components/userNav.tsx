// components/UserNav.tsx
"use client"
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";

export default function UserNav() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

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
          onClick={() => (window.location.href = "/auth/login")}
          className="w-full"
        >
          Login
        </Button>
      )}
    </div>
  );
}
