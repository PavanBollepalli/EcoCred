"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  BookOpen,
  CheckCircle
} from "lucide-react"
import { getCurrentUserFromSession, getSubmissions, getTasks, getCompletedLessonsCount } from "@/lib/storage-api"
import type { User, Submission, Task } from "@/lib/storage-api"

interface ProgressStats {
  totalPoints: number
  completedTasks: number
  completedLessons: number
  streak: number
  tasksByCategory: { [key: string]: number }
  weeklyGoal: number
  monthlyGoal: number
}

export function ProgressTracker() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const currentUser = getCurrentUserFromSession()
        if (!currentUser) return

        setUser(currentUser)

        const [submissions, tasks, completedLessonsCount] = await Promise.all([
          getSubmissions(),
          getTasks(),
          getCompletedLessonsCount(currentUser.id)
        ])

        const userSubmissions = submissions.filter(s => s.studentId === currentUser.id && s.status === "approved")
        
        const tasksByCategory = userSubmissions.reduce((acc, submission) => {
          const task = tasks.find(t => t.id === submission.taskId)
          if (task) {
            acc[task.category] = (acc[task.category] || 0) + 1
          }
          return acc
        }, {} as { [key: string]: number })

        const totalPoints = userSubmissions.reduce((sum, submission) => {
          const task = tasks.find(t => t.id === submission.taskId)
          return sum + (task?.points || 0)
        }, 0)

        setStats({
          totalPoints,
          completedTasks: userSubmissions.length,
          completedLessons: completedLessonsCount,
          streak: currentUser.streak,
          tasksByCategory,
          weeklyGoal: 100,
          monthlyGoal: 500
        })
      } catch (error) {
        console.error('Error loading progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProgressData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user || !stats) return null

  const weeklyProgress = (stats.totalPoints / stats.weeklyGoal) * 100
  const monthlyProgress = (stats.totalPoints / stats.monthlyGoal) * 100

  const categoryIcons = {
    planting: TreePine,
    waste: Recycle,
    energy: Zap,
    water: Droplets
  }

  const categoryColors = {
    planting: "text-green-600",
    waste: "text-blue-600", 
    energy: "text-yellow-600",
    water: "text-cyan-600"
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Points and Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.completedLessons}</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Goals Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Weekly Goal</span>
                <span className="text-sm text-muted-foreground">{stats.totalPoints}/{stats.weeklyGoal} points</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(weeklyProgress)}% complete
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Monthly Goal</span>
                <span className="text-sm text-muted-foreground">{stats.totalPoints}/{stats.monthlyGoal} points</span>
              </div>
              <Progress value={monthlyProgress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(monthlyProgress)}% complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Activity by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.tasksByCategory).map(([category, count]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              const colorClass = categoryColors[category as keyof typeof categoryColors]
              
              return (
                <div key={category} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${colorClass}`} />
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{category}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Eco Warrior</p>
                <p className="text-sm text-muted-foreground">Earned 100+ eco points</p>
              </div>
            </div>
            <Badge variant="default">Earned!</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
