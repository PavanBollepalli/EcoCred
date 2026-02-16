"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, KeyRound, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react"

type Step = "email" | "otp" | "new-password" | "success"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send OTP")
        return
      }

      setSuccess("OTP sent to your email! Check your inbox (and spam folder).")
      setStep("otp")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      setSuccess("OTP verified! Set your new password.")
      setStep("new-password")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to reset password")
        return
      }

      setStep("success")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP")
        return
      }

      setSuccess("New OTP sent to your email!")
      setOtp("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {step === "email" && "Forgot Password"}
          {step === "otp" && "Verify OTP"}
          {step === "new-password" && "Set New Password"}
          {step === "success" && "Password Reset!"}
        </CardTitle>
        <CardDescription>
          {step === "email" && "Enter your email to receive a verification code"}
          {step === "otp" && `Enter the 6-digit code sent to ${email}`}
          {step === "new-password" && "Create a strong new password"}
          {step === "success" && "Your password has been reset successfully"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === "email" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
          }`}>
            <Mail className="h-4 w-4" />
          </div>
          <div className={`w-8 h-0.5 ${step !== "email" ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === "otp" ? "bg-primary text-primary-foreground" : step === "email" ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
          }`}>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className={`w-8 h-0.5 ${step === "new-password" || step === "success" ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === "new-password" ? "bg-primary text-primary-foreground" : step === "success" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <KeyRound className="h-4 w-4" />
          </div>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  // Only allow digits, max 6
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                  setOtp(val)
                }}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                Didn't receive OTP? Resend
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "new-password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-muted-foreground">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to Sign In
            </Button>
          </div>
        )}

        {/* Back to login link */}
        {step !== "success" && (
          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
