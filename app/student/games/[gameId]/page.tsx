"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { GameContainer } from '@/components/games/GameContainer'
import { EnergyConservationGame } from '@/components/games/EnergyConservationGame'
import { WasteSegregationGame } from '@/components/games/WasteSegregationGame'
import { WaterConservationGame } from '@/components/games/WaterConservationGame'
import { PollutionCleanupGame } from '@/components/games/PollutionCleanupGame'
import { getCurrentUserFromSession } from '@/lib/storage-api'

const GAMES: Record<string, { component: any; name: string; description: string }> = {
    'energy-conservation': {
        component: EnergyConservationGame,
        name: 'Energy Conservation',
        description: 'Turn off all lights to save energy and reduce your carbon footprint',
    },
    'waste-segregation': {
        component: WasteSegregationGame,
        name: 'Waste Segregation',
        description: 'Sort waste into wet and dry bins to promote recycling',
    },
    'water-conservation': {
        component: WaterConservationGame,
        name: 'Water Conservation',
        description: 'Fix all leaking taps to conserve precious water resources',
    },
    'pollution-cleanup': {
        component: PollutionCleanupGame,
        name: 'Pollution Cleanup',
        description: 'Clean up pollution to restore the environment',
    },
}

export default function GamePlayPage() {
    const params = useParams()
    const router = useRouter()
    const gameId = params.gameId as string
    const [isCompleted, setIsCompleted] = useState(false)
    const [loading, setLoading] = useState(true)

    const game = GAMES[gameId]

    useEffect(() => {
        const checkCompletion = async () => {
            const user = getCurrentUserFromSession()
            if (user) {
                try {
                    const response = await fetch(`/api/games/complete?userId=${user.id}`)
                    const games = await response.json()
                    const currentGame = games.find((g: any) => g.id === gameId)
                    setIsCompleted(currentGame?.completed || false)
                } catch (error) {
                    console.error('Error checking game completion:', error)
                }
            }
            setLoading(false)
        }

        checkCompletion()
    }, [gameId])

    const handleComplete = () => {
        setIsCompleted(true)
        // Optionally refresh user data or navigate back
        setTimeout(() => {
            router.push('/student/games')
        }, 3000)
    }

    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
                    <Button onClick={() => router.push('/student/games')}>
                        Back to Games
                    </Button>
                </div>
            </div>
        )
    }

    const GameComponent = game.component

    return (
        <AuthGuard requiredRole="student">
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />

                <main className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/student/games')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Games
                    </Button>

                    {/* Game */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading game...</p>
                        </div>
                    ) : (
                        <GameContainer
                            gameId={gameId}
                            gameName={game.name}
                            description={game.description}
                            onComplete={handleComplete}
                            isCompleted={isCompleted}
                        >
                            {({ onComplete, isSubmitting }: any) => (
                                <GameComponent onComplete={onComplete} isSubmitting={isSubmitting} />
                            )}
                        </GameContainer>
                    )}
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
