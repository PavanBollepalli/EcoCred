"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Star, Trophy, Flame, TreePine, Recycle, Zap, Droplets, Medal, Crown, Gem, Heart, Sparkles, Target } from "lucide-react"

// Icon mapping for dynamic badges
const ICON_MAP: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Trophy,
  Star,
  Award,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  Flame,
  Target,
  Medal,
  Crown,
  Gem,
  Heart,
  Sparkles,
}

interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requirement: number
  requirementType?: string
  category?: string
  color: string
}

// Default static badges (fallback)
const STATIC_BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first environmental task",
    icon: <Star className="h-4 w-4" />,
    requirement: 1,
    requirementType: "tasks",
    color: "bg-blue-500",
  },
  {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Earn 100 eco-points",
    icon: <Award className="h-4 w-4" />,
    requirement: 100,
    requirementType: "points",
    color: "bg-green-500",
  },
  {
    id: "tree-hugger",
    name: "Tree Hugger",
    description: "Complete 5 tree planting tasks",
    icon: <TreePine className="h-4 w-4" />,
    requirement: 5,
    requirementType: "category_tasks",
    category: "planting",
    color: "bg-emerald-500",
  },
  {
    id: "waste-warrior",
    name: "Waste Warrior",
    description: "Complete 5 waste management tasks",
    icon: <Recycle className="h-4 w-4" />,
    requirement: 5,
    requirementType: "category_tasks",
    category: "waste",
    color: "bg-lime-500",
  },
  {
    id: "energy-saver",
    name: "Energy Saver",
    description: "Complete 5 energy conservation tasks",
    icon: <Zap className="h-4 w-4" />,
    requirement: 5,
    requirementType: "category_tasks",
    category: "energy",
    color: "bg-yellow-500",
  },
  {
    id: "water-guardian",
    name: "Water Guardian",
    description: "Complete 5 water conservation tasks",
    icon: <Droplets className="h-4 w-4" />,
    requirement: 5,
    requirementType: "category_tasks",
    category: "water",
    color: "bg-blue-500",
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintain a 7-day activity streak",
    icon: <Flame className="h-4 w-4" />,
    requirement: 7,
    requirementType: "streak",
    color: "bg-orange-500",
  },
  {
    id: "champion",
    name: "Environmental Champion",
    description: "Earn 500 eco-points",
    icon: <Trophy className="h-4 w-4" />,
    requirement: 500,
    requirementType: "points",
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
  const [dynamicBadges, setDynamicBadges] = useState<BadgeDefinition[]>([])

  // Fetch dynamic badges from API
  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch('/api/badges')
        if (response.ok) {
          const badges = await response.json()
          // Convert dynamic badges to BadgeDefinition format
          const converted: BadgeDefinition[] = badges.map((badge: any) => {
            const IconComponent = ICON_MAP[badge.icon] || Award
            return {
              id: badge.id,
              name: badge.name,
              description: badge.description || '',
              icon: <IconComponent className="h-4 w-4" />,
              requirement: badge.requirement.value,
              requirementType: badge.requirement.type,
              category: badge.requirement.category,
              color: badge.color,
            }
          })
          setDynamicBadges(converted)
        }
      } catch (error) {
        console.error('Error fetching badges:', error)
      }
    }
    fetchBadges()
  }, [])

  // Use dynamic badges if available, otherwise fall back to static badges
  // Avoid duplicating badges by checking IDs
  const allBadges = dynamicBadges.length > 0
    ? [
        ...STATIC_BADGE_DEFINITIONS.filter(
          (sb) => !dynamicBadges.some((db) => db.id === sb.id || db.name === sb.name)
        ),
        ...dynamicBadges,
      ]
    : STATIC_BADGE_DEFINITIONS

  const getBadgeProgress = (badge: BadgeDefinition) => {
    let current = 0
    const totalTasks = Object.values(completedTasks).reduce((sum, count) => sum + count, 0)

    switch (badge.requirementType) {
      case "points":
        current = userPoints
        break
      case "tasks":
        current = totalTasks
        break
      case "lessons":
        // TODO: Add lessons count when available
        current = 0
        break
      case "streak":
        current = streak
        break
      case "category_tasks":
        if (badge.category) {
          current = completedTasks[badge.category] || 0
        }
        break
      default:
        // Fallback for old badge IDs
        switch (badge.id) {
          case "first-step":
            current = totalTasks > 0 ? 1 : 0
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
        }
    }

    return Math.min(current, badge.requirement)
  }

  const isEarned = (badge: BadgeDefinition) => {
    // Check if badge is explicitly in user's badges array (by ID or name)
    if (userBadges.includes(badge.id) || userBadges.includes(badge.name)) return true
    // Only auto-earn if requirement > 0 and progress meets it
    if (badge.requirement <= 0) return false
    const progress = getBadgeProgress(badge)
    return progress >= badge.requirement
  }

  const earnedBadges = allBadges.filter((badge) => isEarned(badge))
  const availableBadges = allBadges.filter((badge) => !isEarned(badge))

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
          {availableBadges.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              🎉 Congratulations! You've earned all available badges!
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
