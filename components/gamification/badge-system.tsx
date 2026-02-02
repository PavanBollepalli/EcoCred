"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Star, Trophy, Flame, TreePine, Recycle, Zap, Droplets } from "lucide-react"

interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requirement: number
  category?: string
  color: string
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first environmental task",
    icon: <Star className="h-4 w-4" />,
    requirement: 1,
    color: "bg-blue-500",
  },
  {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Earn 100 eco-points",
    icon: <Award className="h-4 w-4" />,
    requirement: 100,
    color: "bg-green-500",
  },
  {
    id: "tree-hugger",
    name: "Tree Hugger",
    description: "Complete 5 tree planting tasks",
    icon: <TreePine className="h-4 w-4" />,
    requirement: 5,
    category: "planting",
    color: "bg-emerald-500",
  },
  {
    id: "waste-warrior",
    name: "Waste Warrior",
    description: "Complete 5 waste management tasks",
    icon: <Recycle className="h-4 w-4" />,
    requirement: 5,
    category: "waste",
    color: "bg-lime-500",
  },
  {
    id: "energy-saver",
    name: "Energy Saver",
    description: "Complete 5 energy conservation tasks",
    icon: <Zap className="h-4 w-4" />,
    requirement: 5,
    category: "energy",
    color: "bg-yellow-500",
  },
  {
    id: "water-guardian",
    name: "Water Guardian",
    description: "Complete 5 water conservation tasks",
    icon: <Droplets className="h-4 w-4" />,
    requirement: 5,
    category: "water",
    color: "bg-blue-500",
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintain a 7-day activity streak",
    icon: <Flame className="h-4 w-4" />,
    requirement: 7,
    color: "bg-orange-500",
  },
  {
    id: "champion",
    name: "Environmental Champion",
    description: "Earn 500 eco-points",
    icon: <Trophy className="h-4 w-4" />,
    requirement: 500,
    color: "bg-purple-500",
  },
]

interface BadgeSystemProps {
  userPoints: number
  userBadges: string[]
  completedTasks: { [category: string]: number }
  streak: number
}

export function BadgeSystem({ userPoints, userBadges, completedTasks, streak }: BadgeSystemProps) {
  const getBadgeProgress = (badge: BadgeDefinition) => {
    let current = 0

    switch (badge.id) {
      case "first-step":
        current = Object.values(completedTasks).reduce((sum, count) => sum + count, 0) > 0 ? 1 : 0
        break
      case "eco-warrior":
      case "champion":
        current = userPoints
        break
      case "tree-hugger":
        current = completedTasks.planting || 0
        break
      case "waste-warrior":
        current = completedTasks.waste || 0
        break
      case "energy-saver":
        current = completedTasks.energy || 0
        break
      case "water-guardian":
        current = completedTasks.water || 0
        break
      case "streak-master":
        current = streak
        break
      default:
        current = 0
    }

    return Math.min(current, badge.requirement)
  }

  const isEarned = (badgeId: string) => userBadges.includes(badgeId)

  const earnedBadges = BADGE_DEFINITIONS.filter((badge) => isEarned(badge.id))
  const availableBadges = BADGE_DEFINITIONS.filter((badge) => !isEarned(badge.id))

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Earned Badges ({earnedBadges.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="text-center p-4 rounded-lg bg-muted/50 border-2 border-primary/20">
                  <div
                    className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mx-auto mb-2`}
                  >
                    <div className="text-white">{badge.icon}</div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  <Badge variant="default" className="mt-2 text-xs">
                    Earned!
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span>Available Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBadges.map((badge) => {
              const progress = getBadgeProgress(badge)
              const progressPercentage = (progress / badge.requirement) * 100

              return (
                <div key={badge.id} className="p-4 rounded-lg border">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center opacity-60`}
                    >
                      <div className="text-white">{badge.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            Progress: {progress}/{badge.requirement}
                          </span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
