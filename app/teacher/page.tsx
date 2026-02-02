"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList,
  Users,
  TrendingUp,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  LogOut,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  BookOpen,
  Award,
  GraduationCap,
} from "lucide-react"
import {
  getCurrentUser,
  setCurrentUser,
  getCurrentUserFromSession,
  getTasks,
  getSubmissions,
  getUsers,
  saveSubmission,
  saveUser,
  updateGlobalStats,
  getGlobalStats,
  getCompletedLessonsCount,
} from "@/lib/storage-api"
import type { User, Task, Submission } from "@/lib/storage-api"
import { Calendar } from "@/components/calendar"
import { SeasonalEvents } from "@/components/seasonal-events"
import { Announcements } from "@/components/announcements"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TeacherPortal() {
  return (
    <AuthGuard requiredRole="teacher">
      <TeacherDashboard />
    </AuthGuard>
  )
}

function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const router = useRouter()

  const loadData = async () => {
    try {
      const currentUser = getCurrentUserFromSession()
      const allTasks = await getTasks()
      const allSubmissions = await getSubmissions()
      const allUsers = await getUsers()
      const studentUsers = allUsers.filter((u) => u.role === "student")

      setUser(currentUser)
      setTasks(allTasks)
      setSubmissions(allSubmissions)
      setStudents(studentUsers)
    } catch (error) {
      console.error('Error loading teacher data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push("/")
  }

  const handleReviewSubmission = async (submissionId: string, status: "approved" | "rejected") => {
    if (!user) return

    setIsReviewing(true)

    try {
      const submission = submissions.find((s) => s.id === submissionId)
      if (!submission) return

      const updatedSubmission: Submission = {
        ...submission,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.id,
        comments: reviewComment,
      }

      await saveSubmission(updatedSubmission)

      // Update student points if approved
      if (status === "approved") {
        const student = students.find((s) => s.id === submission.studentId)
        const task = tasks.find((t) => t.id === submission.taskId)

        if (student && task) {
          const updatedStudent: User = {
            ...student,
            ecoPoints: student.ecoPoints + task.points,
            streak: student.streak + 1,
          }

          // Add badge if milestone reached
          if (updatedStudent.ecoPoints >= 100 && !updatedStudent.badges.includes("Eco Warrior")) {
            updatedStudent.badges.push("Eco Warrior")
          }

          await saveUser(updatedStudent)

          // Update global stats
          const stats = await getGlobalStats()
          if (task.category === "planting") {
            await updateGlobalStats({ totalSaplings: stats.totalSaplings + 1 })
          } else if (task.category === "waste") {
            await updateGlobalStats({ totalWasteSaved: stats.totalWasteSaved + 5 })
          }
        }
      }

      // Refresh data
      await loadData()
      setSelectedSubmission(null)
      setReviewComment("")
    } catch (error) {
      console.error("Error reviewing submission:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const approvedSubmissions = submissions.filter((s) => s.status === "approved")
  const totalSubmissions = submissions.length
  const activeStudents = students.length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
              <p className="text-primary-foreground/80">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
                <div className="text-sm text-primary-foreground/80">Pending Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{activeStudents}</div>
                <div className="text-sm text-primary-foreground/80">Active Students</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Your Students</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{pendingSubmissions.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting your review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <ClipboardList className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground">All time submissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{activeStudents}</div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {totalSubmissions > 0 ? Math.round((approvedSubmissions.length / totalSubmissions) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Tasks approved</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .slice(0, 5)
                      .map((submission) => {
                        const student = students.find((s) => s.id === submission.studentId)
                        const task = tasks.find((t) => t.id === submission.taskId)
                        return (
                          <div key={submission.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                            <div className="flex-shrink-0">
                              {task?.category === "planting" && <TreePine className="h-5 w-5 text-primary" />}
                              {task?.category === "waste" && <Recycle className="h-5 w-5 text-secondary" />}
                              {task?.category === "energy" && <Zap className="h-5 w-5 text-yellow-500" />}
                              {task?.category === "water" && <Droplets className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{task?.title}</p>
                              <p className="text-sm text-muted-foreground">
                                by {student?.name} • {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                submission.status === "approved"
                                  ? "default"
                                  : submission.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {submission.status}
                            </Badge>
                            {submission.status === "pending" && (
                              <Button size="sm" onClick={() => setSelectedSubmission(submission)} className="ml-2">
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Students */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students
                      .sort((a, b) => b.ecoPoints - a.ecoPoints)
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-amber-600"
                                      : "bg-primary"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.ecoPoints} eco-points • {student.streak} day streak
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {student.badges.slice(0, 3).map((badge, badgeIndex) => (
                              <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No students registered yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>
                      Your Students (
                      {
                        students.filter(
                          (student) =>
                            student.school && student.school === user?.school,
                        ).length
                      }
                      )
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {students.filter(
                    (student) =>
                      student.school && student.school === user?.school,
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {students
                        .filter(
                          (student) =>
                            student.school && student.school === user?.school,
                        )
                        .sort((a, b) => b.ecoPoints - a.ecoPoints)
                        .map((student) => {
                          const studentSubmissions = submissions.filter((s) => s.studentId === student.id)
                          const completedTasks = studentSubmissions.filter((s) => s.status === "approved").length
                          const completedLessons = getCompletedLessonsCount(student.id)

                          return (
                            <div
                              key={student.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedStudent?.id === student.id
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedStudent(student)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{student.name}</h4>
                                <Badge variant="outline">{student.ecoPoints} points</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                              <p className="text-sm text-muted-foreground mb-2">{student.school}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{completedTasks} tasks</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="h-3 w-3 text-blue-500" />
                                  <span>{completedLessons} lessons</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Award className="h-3 w-3 text-yellow-500" />
                                  <span>{student.badges.length} badges</span>
                                </span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No students from Punjab schools yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Students will appear here once they register</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStudent ? (
                    <div className="space-y-6">
                      {/* Student Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">{selectedStudent.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{selectedStudent.email}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">School:</span>
                            <p className="font-medium">{selectedStudent.school}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Joined:</span>
                            <p className="font-medium">{new Date(selectedStudent.joinedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Eco-Points:</span>
                            <p className="font-medium text-primary">{selectedStudent.ecoPoints}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Streak:</span>
                            <p className="font-medium text-orange-500">{selectedStudent.streak} days</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div>
                        <h4 className="font-semibold mb-3">Progress Overview</h4>
                        <div className="space-y-3">
                          {(() => {
                            const studentSubmissions = submissions.filter((s) => s.studentId === selectedStudent.id)
                            const completedTasks = studentSubmissions.filter((s) => s.status === "approved").length
                            const pendingTasks = studentSubmissions.filter((s) => s.status === "pending").length
                            const completedLessons = getCompletedLessonsCount(selectedStudent.id)

                            return (
                              <>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                  <span className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Completed Tasks</span>
                                  </span>
                                  <span className="font-bold text-green-600">{completedTasks}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                  <span className="flex items-center space-x-2">
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                    <span>Completed Lessons</span>
                                  </span>
                                  <span className="font-bold text-blue-600">{completedLessons}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                  <span className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span>Pending Tasks</span>
                                  </span>
                                  <span className="font-bold text-yellow-600">{pendingTasks}</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Badges */}
                      <div>
                        <h4 className="font-semibold mb-3">Badges Earned</h4>
                        {selectedStudent.badges.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                <Award className="h-3 w-3" />
                                <span>{badge}</span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No badges earned yet</p>
                        )}
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="font-semibold mb-3">Recent Activity</h4>
                        {(() => {
                          const studentSubmissions = submissions
                            .filter((s) => s.studentId === selectedStudent.id)
                            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                            .slice(0, 5)

                          return studentSubmissions.length > 0 ? (
                            <div className="space-y-2">
                              {studentSubmissions.map((submission) => {
                                const task = tasks.find((t) => t.id === submission.taskId)
                                return (
                                  <div
                                    key={submission.id}
                                    className="flex items-center justify-between p-2 bg-muted/30 rounded"
                                  >
                                    <div className="flex items-center space-x-2">
                                      {task?.category === "planting" && <TreePine className="h-4 w-4 text-primary" />}
                                      {task?.category === "waste" && <Recycle className="h-4 w-4 text-secondary" />}
                                      {task?.category === "energy" && <Zap className="h-4 w-4 text-yellow-500" />}
                                      {task?.category === "water" && <Droplets className="h-4 w-4 text-blue-500" />}
                                      <span className="text-sm font-medium">{task?.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant={
                                          submission.status === "approved"
                                            ? "default"
                                            : submission.status === "pending"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {submission.status}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No recent activity</p>
                          )
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a student to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>Pending Reviews ({pendingSubmissions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {pendingSubmissions.map((submission) => {
                        const student = students.find((s) => s.id === submission.studentId)
                        const task = tasks.find((t) => t.id === submission.taskId)
                        return (
                          <div key={submission.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{task?.title}</h4>
                              <Badge variant="outline">{task?.points} points</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">by {student?.name}</p>
                            <p className="text-sm text-muted-foreground mb-2">{student?.school}</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                            {submission.location && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Location:</strong> {submission.location}
                              </p>
                            )}
                            {submission.mlConfidence && (
                              <p className="text-sm text-muted-foreground mb-3">
                                AI Confidence: {submission.mlConfidence}%
                              </p>
                            )}
                            <Button size="sm" onClick={() => setSelectedSubmission(submission)} className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              Review Submission
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">All caught up!</p>
                      <p className="text-sm text-muted-foreground mt-2">No pending submissions to review</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSubmission ? (
                    <div className="space-y-4">
                      {(() => {
                        const student = students.find((s) => s.id === selectedSubmission.studentId)
                        const task = tasks.find((t) => t.id === selectedSubmission.taskId)
                        return (
                          <>
                            <div>
                              <h4 className="font-semibold mb-2">{task?.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{task?.description}</p>
                              <p className="text-sm">
                                <strong>Student:</strong> {student?.name}
                              </p>
                              <p className="text-sm">
                                <strong>School:</strong> {student?.school}
                              </p>
                              <p className="text-sm">
                                <strong>Points:</strong> {task?.points}
                              </p>
                              <p className="text-sm">
                                <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                              </p>
                              {selectedSubmission.location && (
                                <p className="text-sm">
                                  <strong>Location:</strong> {selectedSubmission.location}
                                </p>
                              )}
                              {selectedSubmission.mlConfidence && (
                                <p className="text-sm">
                                  <strong>AI Verification:</strong> {selectedSubmission.mlConfidence}% confidence
                                </p>
                              )}
                            </div>

                            {selectedSubmission.evidence && selectedSubmission.evidence.startsWith('http') && (
                              <div>
                                <label className="text-sm font-medium">Evidence Image</label>
                                <div className="mt-2">
                                  <img
                                    src={selectedSubmission.evidence}
                                    alt="Task evidence"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              </div>
                            )}

                            {selectedSubmission.description && (
                              <div>
                                <label className="text-sm font-medium">Student Description</label>
                                <div className="mt-1 p-3 border rounded-lg bg-muted/30">
                                  <p className="text-sm">{selectedSubmission.description}</p>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">Evidence</label>
                              <div className="mt-1 p-4 border rounded-lg bg-muted/50">
                                {selectedSubmission.evidence.startsWith("http") ? (
                                  <div>
                                    <p className="text-sm font-medium mb-2">Image Evidence:</p>
                                    <a
                                      href={selectedSubmission.evidence}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                    >
                                      {selectedSubmission.evidence}
                                    </a>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Click the link above to view the student&apos;s evidence image
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm text-muted-foreground">File: {selectedSubmission.evidence}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      (In a real app, this would show the uploaded image/video)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Comments (Optional)</label>
                              <textarea
                                className="w-full mt-1 p-2 border rounded-md"
                                rows={3}
                                placeholder="Add feedback for the student..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleReviewSubmission(selectedSubmission.id, "approved")}
                                disabled={isReviewing}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReviewSubmission(selectedSubmission.id, "rejected")}
                                disabled={isReviewing}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a submission to review</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Submission Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Submissions</span>
                      <span className="font-bold">{totalSubmissions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Approved</span>
                      <span className="font-bold text-green-500">{approvedSubmissions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending</span>
                      <span className="font-bold text-yellow-500">{pendingSubmissions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rejected</span>
                      <span className="font-bold text-red-500">
                        {submissions.filter((s) => s.status === "rejected").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["planting", "waste", "energy", "water"].map((category) => {
                      const categorySubmissions = submissions.filter((s) => {
                        const task = tasks.find((t) => t.id === s.taskId)
                        return task?.category === category
                      })
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {category === "planting" && <TreePine className="h-4 w-4 text-primary" />}
                            {category === "waste" && <Recycle className="h-4 w-4 text-secondary" />}
                            {category === "energy" && <Zap className="h-4 w-4 text-yellow-500" />}
                            {category === "water" && <Droplets className="h-4 w-4 text-blue-500" />}
                            <span className="capitalize">{category}</span>
                          </div>
                          <span className="font-bold">{categorySubmissions.length}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Students</span>
                      <span className="font-bold">{students.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Points</span>
                      <span className="font-bold">
                        {students.length > 0
                          ? Math.round(students.reduce((sum, s) => sum + s.ecoPoints, 0) / students.length)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Students with Badges</span>
                      <span className="font-bold">{students.filter((s) => s.badges.length > 0).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submissions
                      .filter((s) => s.status === "approved")
                      .sort((a, b) => new Date(b.reviewedAt || "").getTime() - new Date(a.reviewedAt || "").getTime())
                      .slice(0, 5)
                      .map((submission) => {
                        const student = students.find((s) => s.id === submission.studentId)
                        const task = tasks.find((t) => t.id === submission.taskId)
                        return (
                          <div key={submission.id} className="text-sm">
                            <span className="font-medium">{student?.name}</span> completed{" "}
                            <span className="text-primary">{task?.title}</span>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Tasks</h2>
              <Button asChild>
                <Link href="/teacher/create-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Task
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const taskSubmissions = submissions.filter((s) => s.taskId === task.id)
                const completedCount = taskSubmissions.filter((s) => s.status === "approved").length
                return (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {task.category === "planting" && <TreePine className="h-5 w-5 text-primary" />}
                          {task.category === "waste" && <Recycle className="h-5 w-5 text-secondary" />}
                          {task.category === "energy" && <Zap className="h-5 w-5 text-yellow-500" />}
                          {task.category === "water" && <Droplets className="h-5 w-5 text-blue-500" />}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                        </div>
                        <Badge variant="outline">{task.points} pts</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>Completed: {completedCount}</span>
                        <span>Pending: {taskSubmissions.filter((s) => s.status === "pending").length}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <SeasonalEvents userRole={user?.role} />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Announcements schoolId={user?.school} targetAudience="students" showAddButton={true} userRole={user?.role} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Calendar schoolId={user?.school} showAddEvent={true} userRole={user?.role} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
