"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Recycle, Droplets, TreePine, Trophy, Clock, Target, CheckCircle } from 'lucide-react'
import { getCurrentUserFromSession } from '@/lib/storage-api'

interface Game {
    id: string
    name: string
    description: string
    category: 'energy' | 'waste' | 'water' | 'pollution'
    points: number
    badgeName: string
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedTime: string
    completed?: boolean
}

const GAME_ICONS = {
    energy: Zap,
    waste: Recycle,
    water: Droplets,
    pollution: TreePine,
}

const GAME_COLORS = {
    energy: 'border-yellow-500 bg-yellow-50',
    waste: 'border-green-500 bg-green-50',
    water: 'border-blue-500 bg-blue-50',
    pollution: 'border-emerald-500 bg-emerald-50',
}

export default function GamesPage() {
    const router = useRouter()
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string>('')

    useEffect(() => {
        const user = getCurrentUserFromSession()
        if (user) {
            setUserId(user.id)
            fetchGames(user.id)
        }
    }, [])

    const fetchGames = async (userId: string) => {
        try {
            const response = await fetch(`/api/games/complete?userId=${userId}`)
            const data = await response.json()
            setGames(data)
        } catch (error) {
            console.error('Error fetching games:', error)
        } finally {
            setLoading(false)
        }
    }

    const completedCount = games.filter(g => g.completed).length
    const totalGames = games.length
    const completionPercentage = totalGames > 0 ? (completedCount / totalGames) * 100 : 0

    return (
        <AuthGuard requiredRole="student">
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />

                <main className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Educational Games 🎮</h1>
                        <p className="text-muted-foreground">
                            Learn about environmental conservation through fun, interactive games!
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <Card className="mb-8 border-2 border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-600" />
                                Your Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>Games Completed</span>
                                    <span className="font-semibold">{completedCount} / {totalGames}</span>
                                </div>
                                <Progress value={completionPercentage} className="h-3" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{completedCount}</div>
                                        <div className="text-xs text-muted-foreground">Completed</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{totalGames - completedCount}</div>
                                        <div className="text-xs text-muted-foreground">Remaining</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{completedCount * 50}</div>
                                        <div className="text-xs text-muted-foreground">Points Earned</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{completedCount}</div>
                                        <div className="text-xs text-muted-foreground">Badges Earned</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Games Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading games...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {games.map((game) => {
                                const Icon = GAME_ICONS[game.category]
                                const colorClass = GAME_COLORS[game.category]

                                return (
                                    <Card
                                        key={game.id}
                                        className={`border-2 ${colorClass} shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden`}
                                    >
                                        {game.completed && (
                                            <div className="absolute top-4 right-4">
                                                <Badge className="bg-green-600">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${game.category === 'energy' ? 'bg-yellow-200' : game.category === 'waste' ? 'bg-green-200' : game.category === 'water' ? 'bg-blue-200' : 'bg-emerald-200'}`}>
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl mb-2">{game.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{game.description}</p>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Game Info */}
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{game.estimatedTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                        <span className="capitalize">{game.difficulty}</span>
                                                    </div>
                                                </div>

                                                {/* Rewards */}
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Rewards</div>
                                                        <div className="font-semibold">+{game.points} points</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Badge</div>
                                                        <div className="font-semibold text-sm">{game.badgeName}</div>
                                                    </div>
                                                </div>

                                                {/* Play Button */}
                                                <Button
                                                    onClick={() => router.push(`/student/games/${game.id}`)}
                                                    className="w-full"
                                                    variant={game.completed ? 'outline' : 'default'}
                                                >
                                                    {game.completed ? 'Play Again' : 'Start Game'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {/* Tips Section */}
                    <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle>🎯 Game Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li>• Complete all games to earn maximum points and badges</li>
                                <li>• Each game teaches important environmental conservation concepts</li>
                                <li>• You can replay games, but rewards are only given once</li>
                                <li>• Share what you learned with friends and family!</li>
                            </ul>
                        </CardContent>
                    </Card>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
