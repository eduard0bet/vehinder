"use client"

import { useState } from "react"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

// Function to change the user's password
async function changeUserPassword(
  userId: number,
  newPassword: string,
  confirmPassword: string,
  token: string
) {
  const response = await fetch(`${apiUrl}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error("Error changing password:", errorDetails)
    throw new Error(errorDetails || "Failed to change password.")
  }

  const data = await response.json()
  return data
}

interface ChangePasswordFormProps {
  userId: number
  token: string
  onClose: () => void
}

export default function ChangePasswordForm({
  userId,
  token,
  onClose,
}: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChangePassword = async () => {
    setErrorMessage("") // Reset error message

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    try {
      await changeUserPassword(userId, newPassword, confirmPassword, token)
      toast({ description: "Password changed successfully." })
      setNewPassword("")
      setConfirmPassword("")
      onClose() // Close the dialog
    } catch (error: any) {
      console.error("Error changing password:", error)
      setErrorMessage(error.message || "Failed to change password.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <DialogFooter>
        <Button onClick={handleChangePassword}>Change Password</Button>
      </DialogFooter>
    </div>
  )
}
