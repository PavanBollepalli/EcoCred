import { NextRequest, NextResponse } from 'next/server'
import {
    saveGameCompletion,
    hasCompletedGame,
    getCurrentUser,
    saveUser,
    addPointsLedgerEntry,
    logEvent,
    getBadgeByName,
    saveBadge
} from '@/lib/database'
import type { GameCompletion } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Game definitions
const GAMES = {
    'energy-conservation': {
        id: 'energy-conservation',
        name: 'Energy Conservation',
        points: 50,
        badgeName: 'Energy Saver',
        category: 'energy' as const,
    },
    'waste-segregation': {
        id: 'waste-segregation',
        name: 'Waste Segregation',
        points: 50,
        badgeName: 'Waste Warrior',
        category: 'waste' as const,
    },
    'water-conservation': {
        id: 'water-conservation',
        name: 'Water Conservation',
        points: 50,
        badgeName: 'Water Guardian',
        category: 'water' as const,
    },
    'pollution-cleanup': {
        id: 'pollution-cleanup',
        name: 'Pollution Cleanup',
        points: 50,
        badgeName: 'Eco Champion',
        category: 'pollution' as const,
    },
}

// POST - Record game completion
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, gameId, score = 100 } = body

        if (!userId || !gameId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate game ID
        const game = GAMES[gameId as keyof typeof GAMES]
        if (!game) {
            return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 })
        }

        // Check if already completed
        const alreadyCompleted = await hasCompletedGame(userId, gameId)
        if (alreadyCompleted) {
            return NextResponse.json({ error: 'Game already completed' }, { status: 400 })
        }

        // Save game completion
        const completion: GameCompletion = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId,
            gameId,
            score,
            completedAt: new Date().toISOString(),
            pointsEarned: game.points,
        }

        await saveGameCompletion(completion)

        // Update user points
        const user = await getCurrentUser(userId)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const updatedUser = {
            ...user,
            ecoPoints: user.ecoPoints + game.points,
        }
        await saveUser(updatedUser)

        // Add points ledger entry
        await addPointsLedgerEntry({
            userId,
            points: game.points,
            source: 'game',
            sourceId: gameId,
            timestamp: new Date().toISOString(),
            metadata: {
                gameName: game.name,
                score,
            },
        })

        // Award badge
        let badgeAwarded = false
        let badge = await getBadgeByName(game.badgeName)

        if (!badge) {
            // Create the badge with a deterministic ID based on game
            badge = {
                id: `game-badge-${gameId}`,
                name: game.badgeName,
                description: `Completed the ${game.name} game`,
                icon: game.category === 'energy' ? 'Zap' : game.category === 'waste' ? 'Recycle' : game.category === 'water' ? 'Droplets' : 'TreePine',
                color: game.category === 'energy' ? 'bg-yellow-500' : game.category === 'waste' ? 'bg-green-500' : game.category === 'water' ? 'bg-blue-500' : 'bg-emerald-500',
                requirement: {
                    type: 'tasks',
                    value: 1, // Requires game completion - not auto-awarded
                },
                createdBy: 'system',
                isActive: true,
                createdAt: new Date().toISOString(),
            }
            await saveBadge(badge)
        }

        // Award badge to user using badge ID for consistency
        const badgeId = badge.id
        if (!user.badges.includes(badgeId)) {
            const updatedUserWithBadge = {
                ...updatedUser,
                badges: [...user.badges, badgeId],
            }
            await saveUser(updatedUserWithBadge)
            badgeAwarded = true
        }

        // Log event
        await logEvent({
            userId,
            eventType: 'game_completed',
            eventData: {
                gameId,
                gameName: game.name,
                score,
                pointsEarned: game.points,
                badgeAwarded,
            },
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({
            success: true,
            completion,
            pointsEarned: game.points,
            badgeAwarded,
            badgeName: game.badgeName,
            badge: badgeAwarded && badge ? {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                color: badge.color,
            } : null,
            newTotal: updatedUser.ecoPoints + game.points,
        })
    } catch (error) {
        console.error('Error recording game completion:', error)
        return NextResponse.json({ error: 'Failed to record game completion' }, { status: 500 })
    }
}

// GET - Get list of available games
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        const gamesList = Object.values(GAMES).map(game => ({
            ...game,
            difficulty: game.id === 'pollution-cleanup' || game.id === 'water-conservation' ? 'medium' as const : 'easy' as const,
            estimatedTime: game.id === 'pollution-cleanup' ? '8-10 minutes' : game.id === 'water-conservation' ? '8-10 minutes' : '5 minutes',
            description: game.id === 'pollution-cleanup'
                ? 'Sort pollution into correct waste bins across 3 environments — Beach, Park, and River!'
                : game.id === 'water-conservation'
                ? 'Find and fix water leaks across 3 scenarios with real-time water meters and knowledge quizzes!'
                : `Learn about ${game.category} through interactive gameplay`,
        }))

        // If userId provided, check completion status
        if (userId) {
            const gamesWithStatus = await Promise.all(
                gamesList.map(async (game) => ({
                    ...game,
                    completed: await hasCompletedGame(userId, game.id),
                }))
            )
            return NextResponse.json(gamesWithStatus)
        }

        return NextResponse.json(gamesList)
    } catch (error) {
        console.error('Error fetching games:', error)
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
    }
}
