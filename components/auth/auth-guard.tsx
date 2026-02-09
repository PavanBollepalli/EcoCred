"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserFromSession } from "@/lib/storage-api"
import type { User } from "@/lib/storage-api"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "student" | "teacher" | "admin"
  allowedRoles?: ("student" | "teacher" | "admin")[]
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, allowedRoles, redirectTo = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUserFromSession()

    if (!currentUser) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      handleRedirect(currentUser.role)
      return
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      handleRedirect(currentUser.role)
      return
    }

    setUser(currentUser)
    setIsLoading(false)
  }, [router, requiredRole, allowedRoles, redirectTo])

  const handleRedirect = (role: string) => {
    if (role === "student") {
      router.push("/student")
    } else if (role === "teacher") {
      router.push("/teacher")
    } else if (role === "admin") {
      router.push("/admin")
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
