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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUsers, getUserByEmail, saveUser, setCurrentUser, getSchools } from "@/lib/storage-api"
import type { User } from "@/lib/storage-api"
import { GraduationCap, UserIcon } from "lucide-react"
import { SchoolSelect } from "@/components/school-select"

// Schools are now loaded dynamically from the database via SchoolSelect component

const LOCALITIES = [
  "Amritsar",
  "Ludhiana",
  "Jalandhar",
  "Patiala",
  "Bathinda",
  "Mohali",
  "Chandigarh",
  "Firozpur",
  "Hoshiarpur",
  "Kapurthala",
  "Mansa",
  "Moga",
  "Pathankot",
  "Rupnagar",
  "Sangrur",
  "Shaheed Bhagat Singh Nagar",
  "Sri Muktsar Sahib",
  "Tarn Taran",
  "Fazilka",
  "Barnala",
]

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    locality: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSchoolChange = (value: string) => {
    setFormData({
      ...formData,
      school: value,
    })
  }

  const handleLocalityChange = (value: string) => {
    setFormData({
      ...formData,
      locality: value,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(formData.email)

      if (existingUser) {
        setError("An account with this email already exists")
        return
      }

      // Get school name from school ID
      const schools = await getSchools()
      const selectedSchool = schools.find(school => school.id === formData.school)
      
      if (!selectedSchool) {
        setError("Please select a valid school")
        return
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        role: activeTab as "student" | "teacher",
        school: selectedSchool.name,
        ecoPoints: 0,
        badges: [],
        streak: 0,
        joinedAt: new Date().toISOString(),
        completedLessons: [],
        lessonProgress: {},
      }

      // Save user and set as current
      await saveUser(newUser)
      setCurrentUser(newUser)

      // Redirect based on role
      if (newUser.role === "student") {
        router.push("/student")
      } else {
        router.push("/teacher")
      }
    } catch (err) {
      setError("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join EcoCred</CardTitle>
        <CardDescription>Create your account and start making an impact</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>Teacher</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@school.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School Name</Label>
                <SchoolSelect
                  value={formData.school}
                  onValueChange={handleSchoolChange}
                  placeholder="Select your school"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality/City</Label>
                <Select onValueChange={handleLocalityChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALITIES.map((locality) => (
                      <SelectItem key={locality} value={locality}>
                        {locality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up as Student"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-4 mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Full Name</Label>
                <Input
                  id="teacher-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  name="email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-school">School Name</Label>
                <SchoolSelect
                  value={formData.school}
                  onValueChange={handleSchoolChange}
                  placeholder="Select your school"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password</Label>
                <Input
                  id="teacher-password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-confirmPassword">Confirm Password</Label>
                <Input
                  id="teacher-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up as Teacher"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => router.push("/login")}>
              Sign in here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
