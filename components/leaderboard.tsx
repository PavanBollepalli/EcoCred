"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Medal, 
  Crown,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Award
} from "lucide-react"
import { getUsers } from "@/lib/storage-api"
import type { User } from "@/lib/storage-api"

interface LeaderboardEntry extends User {
  rank: number
  totalTasks: number
  totalLessons: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const users = await getUsers()
        const students = users.filter(user => user.role === 'student')
        
        // Sort by eco points
        const sortedStudents = students
          .sort((a, b) => b.ecoPoints - a.ecoPoints)
          .slice(0, 10) // Top 10
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            totalTasks: Math.floor(user.ecoPoints / 10), // Estimate based on points
            totalLessons: user.completedLessons?.length || 0
          }))

        setLeaderboard(sortedStudents)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">🥇 Champion</Badge>
      case 2:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white">🥈 Runner-up</Badge>
      case 3:
        return <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">🥉 Third Place</Badge>
      default:
        return <Badge variant="outline">Top 10</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>EcoCred Leaderboard</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('week')}
            >
              Week
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('month')}
            >
              Month
            </Button>
            <Button
              variant={timeframe === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('all')}
            >
              All Time
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((student) => (
            <div
              key={student.id}
              className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                student.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20' : 'hover:bg-muted/50'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {getRankIcon(student.rank)}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {student.name.charAt(0)}
                </span>
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm truncate">{student.name}</p>
                  {getRankBadge(student.rank)}
                </div>
                <p className="text-xs text-muted-foreground truncate">{student.school}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">{student.ecoPoints} pts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs">{student.streak} day streak</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex-shrink-0">
                <div className="flex space-x-1">
                  {student.badges?.slice(0, 3).map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                  {student.badges && student.badges.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{student.badges.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{leaderboard.length}</div>
              <div className="text-xs text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {leaderboard.reduce((sum, student) => sum + student.ecoPoints, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round(leaderboard.reduce((sum, student) => sum + student.streak, 0) / leaderboard.length) || 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Streak</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
