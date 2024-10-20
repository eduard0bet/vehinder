// components/UserNav.tsx
"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"

import LoginForm from "./login_form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

export default function UserNav() {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return null
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
        <>
          <Dialog>
            <DialogTrigger>
              <Button size="sm" variant="ghost">
                Login
              </Button>
            </DialogTrigger>
            <DialogContent>
              <LoginForm />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
