import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUser, addPointsLedgerEntry, logEvent } from '@/lib/database'

export const dynamic = 'force-dynamic'

// POST - Check and award daily login bonus
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get user
        const users = await getUsers()
        const user = users.find(u => u.id === userId)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user already received daily reward today
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        const lastRewardDate = user.lastDailyReward

        if (lastRewardDate === today) {
            // Already received reward today
            return NextResponse.json({
                awarded: false,
                points: 0,
                message: 'Daily reward already claimed today'
            })
        }

        // Award daily login bonus
        const DAILY_BONUS_POINTS = 5

        // Update user points and last reward date
        const updatedUser = {
            ...user,
            ecoPoints: user.ecoPoints + DAILY_BONUS_POINTS,
            lastLogin: new Date().toISOString(),
            lastDailyReward: today
        }

        await saveUser(updatedUser)

        // Add points ledger entry
        await addPointsLedgerEntry({
            userId,
            points: DAILY_BONUS_POINTS,
            source: 'daily_login',
            timestamp: new Date().toISOString(),
            metadata: {
                date: today
            }
        })

        // Log event
        await logEvent({
            userId,
            eventType: 'daily_login',
            eventData: {
                points: DAILY_BONUS_POINTS,
                date: today
            },
            timestamp: new Date().toISOString()
        })

        return NextResponse.json({
            awarded: true,
            points: DAILY_BONUS_POINTS,
            message: `Daily login bonus: +${DAILY_BONUS_POINTS} points!`,
            newTotal: updatedUser.ecoPoints
        })
    } catch (error) {
        console.error('Error processing daily login:', error)
        return NextResponse.json({ error: 'Failed to process daily login' }, { status: 500 })
    }
}
