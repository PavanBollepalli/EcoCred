"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUsers, getUserByEmail, setCurrentUser, claimDailyReward } from "@/lib/storage-api"
import { GraduationCap, User, Settings } from "lucide-react"
import { DailyLoginReward } from "@/components/celebrations/daily-login-reward"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [dailyReward, setDailyReward] = useState<{ awarded: boolean; points: number; newTotal?: number } | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Hardcoded admin login for immediate access
      if (email === "admin@ecocred.in" && password === "bhanubhaai" && activeTab === "admin") {
        const adminUser = {
          id: "admin1",
          email: "admin@ecocred.in",
          name: "System Admin",
          role: "admin" as const,
          school: "EcoCred Platform",
          collegeCode: "VVIT", // Admin uses VVIT college code
          ecoPoints: 0,
          badges: [],
          streak: 0,
          joinedAt: new Date().toISOString(),
          completedLessons: [],
          lessonProgress: {},
        }
        setCurrentUser(adminUser)
        router.push("/admin")
        return
      }

      // Extract college code from email dynamically
      const collegeCodeFromEmail = getCollegeCodeFromEmail(email)
      
      // If we couldn't derive a college code, show a warning but allow login
      if (!collegeCodeFromEmail) {
        setError("Could not determine college from email. Please contact administrator.")
        return
      }

      const user = await getUserByEmail(email)

      if (!user || user.role !== activeTab) {
        setError("Invalid email or user type. Please check your credentials.")
        return
      }

      // Validate college code matches email domain
      if (user.collegeCode !== collegeCodeFromEmail) {
        setError("College code mismatch. Please check your email domain.")
        return
      }

      // Verify password
      if (user.password && user.password !== password) {
        setError("Invalid password. Please try again.")
        return
      }

      setCurrentUser(user)

      // Check and award daily login reward for students
      if (user.role === "student") {
        try {
          const rewardResult = await claimDailyReward(user.id)
          if (rewardResult.awarded) {
            setDailyReward({
              awarded: true,
              points: rewardResult.points,
              newTotal: rewardResult.newTotal
            })
          }
        } catch (err) {
          console.error("Failed to claim daily reward:", err)
        }
      }

      // Redirect based on role
      if (user.role === "student") {
        router.push("/student")
      } else if (user.role === "teacher") {
        router.push("/teacher")
      } else if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

// Helper function to extract college code from email - dynamic based on school
function getCollegeCodeFromEmail(email: string, schoolName?: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  
  // If school name is provided, use it to derive college code
  if (schoolName) {
    const derivedCode = schoolName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4)
    if (derivedCode.length >= 2) {
      return derivedCode
    }
  }
  
  // Fallback: try to extract from email domain
  if (domain) {
    const domainParts = domain.split('.')
    if (domainParts.length > 0) {
      const prefix = domainParts[0].toUpperCase()
      const knownDomains: Record<string, string> = {
        'vvit': 'VVIT',
        'viva': 'VIVA',
      }
      return knownDomains[prefix] || prefix.substring(0, 4)
    }
  }
  
  return null
}

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your EcoCred account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Teacher</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In as Student"}
              </Button>
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal text-sm text-muted-foreground"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot Password?
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password</Label>
                <Input
                  id="teacher-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In as Teacher"}
              </Button>
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal text-sm text-muted-foreground"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot Password?
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ecocred.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in as Admin"}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => router.push("/signup")}>
              Sign up here
            </Button>
          </p>
        </div>
      </CardContent>
      {dailyReward && (
        <DailyLoginReward
          isOpen={dailyReward.awarded}
          points={dailyReward.points}
          streak={1}
          onClose={() => setDailyReward(null)}
        />
      )}
    </Card>
  )
}
