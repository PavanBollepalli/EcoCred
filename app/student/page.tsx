"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Star,
  Flame,
  BookOpen,
  Upload,
  Users,
  Award,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  LogOut,
  CheckCircle,
} from "lucide-react"
import {
  getCurrentUser,
  setCurrentUser,
  getCurrentUserFromSession,
  getTasks,
  getSubmissions,
  getUsers,
  getCompletedLessonsCount,
} from "@/lib/storage-api"
import type { User, Task, Submission } from "@/lib/storage-api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BadgeSystem } from "@/components/gamification/badge-system"
import { ProgressTracker } from "@/components/progress-tracker"
import { Leaderboard } from "@/components/leaderboard"
import { NotificationCenter } from "@/components/notification-center"
import { Calendar } from "@/components/calendar"
import { SeasonalEvents } from "@/components/seasonal-events"
import { Announcements } from "@/components/announcements"
import { ProfileCard } from "@/components/avatar"
import { StudentProfile } from "@/components/student-profile"

export default function StudentPortal() {
  return (
    <AuthGuard requiredRole="student">
      <StudentDashboard />
    </AuthGuard>
  )
}

function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUserFromSession()
        const allTasks = await getTasks()
        const allSubmissions = await getSubmissions()
        const students = await getUsers()
        const studentUsers = students.filter((u) => u.role === "student")
        const sortedStudents = studentUsers.sort((a, b) => b.ecoPoints - a.ecoPoints)

        setUser(currentUser)
        setTasks(allTasks)
        setSubmissions(allSubmissions)
        setLeaderboard(sortedStudents)

        if (currentUser) {
          const count = await getCompletedLessonsCount(currentUser.id)
          setCompletedLessonsCount(count)
        }
      } catch (error) {
        console.error('Error loading student data:', error)
      }
    }

    loadData()
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userSubmissions = submissions.filter((s) => s.studentId === user.id)
  const completedTasks = userSubmissions.filter((s) => s.status === "approved").length
  const pendingTasks = userSubmissions.filter((s) => s.status === "pending").length
  const userRank = leaderboard.findIndex((u) => u.id === user.id) + 1

  const completedTasksByCategory = userSubmissions
    .filter((s) => s.status === "approved")
    .reduce(
      (acc, submission) => {
        const task = tasks.find((t) => t.id === submission.taskId)
        if (task) {
          acc[task.category] = (acc[task.category] || 0) + 1
        }
        return acc
      },
      {} as { [key: string]: number },
    )

  const lessons = [
    {
      id: "tree-planting",
      title: "Tree Planting Basics",
      category: "planting",
      icon: TreePine,
      coverImage: "/students-planting-trees-in-school-garden-with-shov.jpg",
      duration: "8 min read",
      points: 15,
      description: "Learn proper tree planting techniques and environmental impact",
    },
    {
      id: "waste-management",
      title: "Waste Management & Recycling",
      category: "waste",
      icon: Recycle,
      coverImage: "/colorful-recycling-bins-with-waste-segregation-sym.jpg",
      duration: "10 min read",
      points: 20,
      description: "Master the 5 R's and proper waste segregation techniques",
    },
    {
      id: "energy-conservation",
      title: "Energy Conservation & Efficiency",
      category: "energy",
      icon: Zap,
      coverImage: "/led-light-bulbs-and-solar-panels-with-energy-savin.jpg",
      duration: "9 min read",
      points: 18,
      description: "Reduce energy consumption and save money with smart techniques",
    },
    {
      id: "water-conservation",
      title: "Water Conservation & Management",
      category: "water",
      icon: Droplets,
      coverImage: "/rainwater-harvesting-system-and-water-conservation.jpg",
      duration: "7 min read",
      points: 16,
      description: "Implement water-saving strategies and rainwater harvesting",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-primary-foreground/80">Ready to make an environmental impact today?</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.ecoPoints}</div>
                <div className="text-sm text-primary-foreground/80">Eco-Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.streak}</div>
                <div className="text-sm text-primary-foreground/80">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <div className="text-sm text-primary-foreground/80">Tasks finished</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedLessonsCount}</div>
                <div className="text-sm text-primary-foreground/80">Lessons completed</div>
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
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="announcements">Updates</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eco-Points</CardTitle>
                  <Trophy className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{user.ecoPoints}</div>
                  <p className="text-xs text-muted-foreground">Rank #{userRank} globally</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{user.streak}</div>
                  <p className="text-xs text-muted-foreground">Days active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
                  <Star className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">Tasks finished</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedLessonsCount}</div>
                  <p className="text-xs text-muted-foreground">Lessons completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Upload className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">Under review</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress to Next Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Progress to Next Badge</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Eco Warrior Badge</span>
                      <span>{user.ecoPoints}/100 points</span>
                    </div>
                    <Progress value={(user.ecoPoints / 100) * 100} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete more environmental tasks and lessons to earn your next badge!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {userSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {userSubmissions.slice(0, 3).map((submission) => {
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
                              Submitted {new Date(submission.submittedAt).toLocaleDateString()}
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
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activities yet. Start with a lesson or task!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessons.map((lesson) => {
                const IconComponent = lesson.icon
                const isCompleted = user.completedLessons?.includes(lesson.id)

                return (
                  <Card
                    key={lesson.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer relative"
                    onClick={() => router.push(`/student/lesson/${lesson.id}`)}
                  >
                    {isCompleted && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={lesson.coverImage || "/placeholder.svg"}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="text-center text-white">
                          <IconComponent className="h-8 w-8 mx-auto mb-2" />
                          <h3 className="text-lg font-bold">{lesson.title}</h3>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{lesson.duration}</Badge>
                        <Badge variant="secondary">{lesson.points} points</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      {isCompleted && (
                        <div className="mt-2 flex items-center text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />+{lesson.points} points earned
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => {
                const userSubmission = userSubmissions.find((s) => s.taskId === task.id)
                return (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {task.category === "planting" && <TreePine className="h-5 w-5 text-primary" />}
                          {task.category === "waste" && <Recycle className="h-5 w-5 text-secondary" />}
                          {task.category === "energy" && <Zap className="h-5 w-5 text-yellow-500" />}
                          {task.category === "water" && <Droplets className="h-5 w-5 text-blue-500" />}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                        </div>
                        <Badge variant="outline">{task.points} points</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      {userSubmission ? (
                        <div className="space-y-3">
                          {userSubmission.evidence && userSubmission.evidence.startsWith('http') && (
                            <div className="w-full h-32 rounded-lg overflow-hidden">
                              <img
                                src={userSubmission.evidence}
                                alt="Task evidence"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                userSubmission.status === "approved"
                                  ? "default"
                                  : userSubmission.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {userSubmission.status}
                            </Badge>
                            {userSubmission.status === "approved" && (
                              <span className="text-sm text-primary font-medium">+{task.points} points earned!</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button asChild className="w-full">
                          <Link href={`/student/task/${task.id}`}>Start Task</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <BadgeSystem
              userPoints={user.ecoPoints}
              userBadges={user.badges}
              completedTasks={completedTasksByCategory}
              streak={user.streak}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <StudentProfile user={user} onUpdate={setUser} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressTracker />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Calendar schoolId={user.school} showAddEvent={false} userRole={user.role} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <SeasonalEvents userRole={user.role} />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Announcements schoolId={user.school} targetAudience="students" showAddButton={false} userRole={user.role} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
