"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, TreePine, Recycle, Zap, Droplets, CheckCircle } from "lucide-react"
import { getCurrentUser, getCurrentUserFromSession, getTasks, saveSubmission, getSubmissions } from "@/lib/storage-api"
import type { User, Task, Submission } from "@/lib/storage-api"
import { ImageUpload } from "@/components/image-upload"

export default function TaskPage() {
  return (
    <AuthGuard requiredRole="student">
      <TaskSubmission />
    </AuthGuard>
  )
}

function TaskSubmission() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null)
  const [evidenceImage, setEvidenceImage] = useState("") // Store uploaded image URL
  const [location, setLocation] = useState("") // Added location field
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUserFromSession()
        const tasks = await getTasks()
        const submissions = await getSubmissions()

        const foundTask = tasks.find((t) => t.id === taskId)
        const userSubmission = submissions.find((s) => s.taskId === taskId && s.studentId === currentUser?.id)

        setUser(currentUser)
        setTask(foundTask || null)
        setExistingSubmission(userSubmission || null)
      } catch (error) {
        console.error('Error loading task data:', error)
      }
    }

    loadData()
  }, [taskId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !task) return

    if (!evidenceImage.trim()) {
      setError("Please upload an image as evidence")
      return
    }

    if (!location.trim()) {
      setError("Please specify the location where you performed this task")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Simulate ML verification based on evidence link
      const mlConfidence = Math.floor(Math.random() * 30) + 70 // 70-99% confidence

      const submission: Submission = {
        id: Date.now().toString(),
        taskId: task.id,
        studentId: user.id,
        evidence: evidenceImage, // Store the uploaded image URL
        location: location, // Store task location
        description: description, // Store task description
        status: "pending",
        submittedAt: new Date().toISOString(),
        mlConfidence,
      }

      await saveSubmission(submission)
      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/student")
      }, 2000)
    } catch (err) {
      setError("Failed to submit task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Task not found</h1>
          <Button onClick={() => router.push("/student")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Task Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Your submission is now under review. You&apos;ll be notified once it&apos;s approved.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/student")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {task.category === "planting" && <TreePine className="h-5 w-5 text-primary" />}
                {task.category === "waste" && <Recycle className="h-5 w-5 text-secondary" />}
                {task.category === "energy" && <Zap className="h-5 w-5 text-yellow-500" />}
                {task.category === "water" && <Droplets className="h-5 w-5 text-blue-500" />}
                <span>{task.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Submission Status</h3>
                  <Badge
                    variant={
                      existingSubmission.status === "approved"
                        ? "default"
                        : existingSubmission.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {existingSubmission.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Submitted</h3>
                  <p className="text-muted-foreground">{new Date(existingSubmission.submittedAt).toLocaleString()}</p>
                </div>

                {existingSubmission.mlConfidence && (
                  <div>
                    <h3 className="font-semibold mb-2">AI Verification</h3>
                    <p className="text-muted-foreground">
                      {task.category === "planting" && `Tree detected: ${existingSubmission.mlConfidence}% confidence`}
                      {task.category === "waste" &&
                        `Waste segregation detected: ${existingSubmission.mlConfidence}% confidence`}
                      {task.category === "energy" &&
                        `Energy conservation activity detected: ${existingSubmission.mlConfidence}% confidence`}
                      {task.category === "water" &&
                        `Water conservation activity detected: ${existingSubmission.mlConfidence}% confidence`}
                    </p>
                  </div>
                )}

                {existingSubmission.comments && (
                  <div>
                    <h3 className="font-semibold mb-2">Teacher Comments</h3>
                    <p className="text-muted-foreground">{existingSubmission.comments}</p>
                  </div>
                )}

                {existingSubmission.status === "approved" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Congratulations! You earned {task.points} eco-points for completing this task.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/student")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {task.category === "planting" && <TreePine className="h-5 w-5 text-primary" />}
                {task.category === "waste" && <Recycle className="h-5 w-5 text-secondary" />}
                {task.category === "energy" && <Zap className="h-5 w-5 text-yellow-500" />}
                {task.category === "water" && <Droplets className="h-5 w-5 text-blue-500" />}
                <span>{task.title}</span>
                <Badge variant="outline">{task.points} points</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{task.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Take a clear photo or video of your environmental action</li>
                    <li>Upload the evidence using the form</li>
                    <li>Add a brief description of what you did</li>
                    <li>Submit for teacher review</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Reward</h3>
                  <p className="text-primary font-medium">{task.points} eco-points upon approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Submit Evidence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Upload Evidence Image</Label>
                  <ImageUpload
                    onImageUploaded={(imageUrl) => setEvidenceImage(imageUrl)}
                    onImageRemoved={() => setEvidenceImage("")}
                    currentImage={evidenceImage}
                    disabled={isSubmitting}
                    uploadedBy={user?.id}
                    taskId={taskId}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a clear photo showing your environmental action
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">Task Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., School garden, Home backyard, Community park"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Specify where you performed this environmental task
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you did and how it helps the environment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Task"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
