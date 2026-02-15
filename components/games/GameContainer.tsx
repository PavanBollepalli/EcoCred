"use client"

import { ReactNode, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Confetti } from '@/components/celebrations/confetti'
import { AchievementPopup } from '@/components/celebrations/achievement-popup'
import type { Badge as BadgeType } from '@/lib/types'

interface GameContainerProps {
    gameId: string
    gameName: string
    description: string
    children: ReactNode
    onComplete: (score: number) => void
    isCompleted: boolean
}

export function GameContainer({
    gameId,
    gameName,
    description,
    children,
    onComplete,
    isCompleted,
}: GameContainerProps) {
    const [gameState, setGameState] = useState<'not_started' | 'playing' | 'completed'>(
        isCompleted ? 'completed' : 'not_started'
    )
    const [showConfetti, setShowConfetti] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [earnedBadge, setEarnedBadge] = useState<BadgeType | null>(null)
    const [showAchievement, setShowAchievement] = useState(false)

    const handleStart = () => {
        setGameState('playing')
    }

    const handleGameComplete = async (score: number) => {
        if (isCompleted || gameState === 'completed') {
            toast.info('You have already completed this game!')
            return
        }

        setIsSubmitting(true)
        try {
            const userId = JSON.parse(sessionStorage.getItem('ecocred_current_user') || '{}').id

            const response = await fetch('/api/games/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, gameId, score }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to record completion')
            }

            setGameState('completed')

            // If badge was awarded, show the full AchievementPopup
            if (data.badgeAwarded && data.badge) {
                // Build a full badge object for the AchievementPopup
                const awardedBadge: BadgeType = {
                    id: data.badge.id,
                    name: data.badge.name,
                    description: data.badge.description,
                    icon: data.badge.icon,
                    color: data.badge.color,
                    requirement: { type: 'tasks', value: 1 },
                    createdBy: 'system',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                }
                setEarnedBadge(awardedBadge)
                // Small delay so the game-complete state renders first
                setTimeout(() => setShowAchievement(true), 600)
            } else {
                // No badge — just show confetti + toast
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 5000)
            }

            toast.success(
                <div>
                    <p className="font-bold">Game Completed! 🎉</p>
                    <p>+{data.pointsEarned} points</p>
                    {data.badgeAwarded && <p>🏆 Badge: {data.badgeName}</p>}
                </div>
            )

            onComplete(score)
        } catch (error) {
            console.error('Error recording game completion:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to record completion')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAchievementClose = () => {
        setShowAchievement(false)
        setEarnedBadge(null)
    }

    return (
        <div className="relative">
            {showConfetti && <Confetti isActive={showConfetti} />}

            {/* Badge earned celebration popup */}
            <AchievementPopup
                badge={earnedBadge}
                isOpen={showAchievement}
                onClose={handleAchievementClose}
            />

            <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                {gameName}
                                {isCompleted && (
                                    <Badge className="bg-green-600">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        Completed
                                    </Badge>
                                )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-2">{description}</p>
                        </div>
                        {gameState === 'not_started' && (
                            <Button onClick={handleStart} size="lg" className="bg-green-600 hover:bg-green-700">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Start Game
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {gameState === 'not_started' && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Click "Start Game" to begin!</p>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="game-area">
                            {typeof children === 'function'
                                ? (children as any)({ onComplete: handleGameComplete, isSubmitting })
                                : children
                            }
                        </div>
                    )}

                    {gameState === 'completed' && (
                        <div className="text-center py-12">
                            <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                            <p className="text-muted-foreground">You've completed this game!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
