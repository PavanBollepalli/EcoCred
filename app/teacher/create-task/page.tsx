"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus } from "lucide-react"
import { getCurrentUser, getCurrentUserFromSession, saveTask } from "@/lib/storage-api"
import type { Task } from "@/lib/storage-api"

export default function CreateTaskPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <CreateTaskForm />
    </AuthGuard>
  )
}

function CreateTaskForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    points: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const user = getCurrentUserFromSession()
      if (!user) {
        setError("You must be logged in to create tasks")
        return
      }

      // Validation
      if (!formData.title.trim()) {
        setError("Task title is required")
        return
      }

      if (!formData.description.trim()) {
        setError("Task description is required")
        return
      }

      if (!formData.category) {
        setError("Please select a category")
        return
      }

      const points = Number.parseInt(formData.points)
      if (isNaN(points) || points < 1 || points > 100) {
        setError("Points must be a number between 1 and 100")
        return
      }

      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as "planting" | "waste" | "energy" | "water",
        points,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      }

      await saveTask(newTask)
      router.push("/teacher")
    } catch (err) {
      setError("Failed to create task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/teacher")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Task</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Plant a Tree in Your Community"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed instructions for students on how to complete this environmental task..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planting">Tree Planting</SelectItem>
                    <SelectItem value="waste">Waste Management</SelectItem>
                    <SelectItem value="energy">Energy Conservation</SelectItem>
                    <SelectItem value="water">Water Conservation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="points">Points Reward</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 50"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Points awarded to students upon task completion</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/teacher")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
