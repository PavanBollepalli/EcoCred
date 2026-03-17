import { NextRequest, NextResponse } from 'next/server'
import { getPointsLedger, getPointsSummary, getCurrentUser, saveUser, addPointsLedgerEntry } from '@/lib/database'

export const dynamic = 'force-dynamic'

// GET - Fetch points ledger or summary for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const action = searchParams.get('action') // 'ledger' or 'summary'

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (action === 'summary') {
            const summary = await getPointsSummary(userId)
            return NextResponse.json(summary)
        } else {
            // Default: return full ledger
            const ledger = await getPointsLedger(userId)
            return NextResponse.json(ledger)
        }
    } catch (error) {
        console.error('Error fetching points data:', error)
        return NextResponse.json({ error: 'Failed to fetch points data' }, { status: 500 })
    }
}

// POST - Admin only: Assign or remove points manually
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, points, action, reason, adminId } = body

        // Validate required fields
        if (!userId || points === undefined || !action || !reason) {
            return NextResponse.json({ error: 'Missing required fields: userId, points, action, reason' }, { status: 400 })
        }

        // Validate action
        if (action !== 'add' && action !== 'remove') {
            return NextResponse.json({ error: 'Invalid action. Must be "add" or "remove"' }, { status: 400 })
        }

        // Verify admin is making the request (in production, this would be from session)
        if (!adminId) {
            return NextResponse.json({ error: 'Admin ID is required for point modifications' }, { status: 403 })
        }

        // Get the admin user to verify they have admin role
        const admin = await getCurrentUser(adminId)
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can modify points' }, { status: 403 })
        }

        // Get the target user
        const user = await getCurrentUser(userId)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate new points
        const pointChange = action === 'add' ? Math.abs(points) : -Math.abs(points)
        const newPoints = Math.max(0, user.ecoPoints + pointChange)

        // Update user points
        const updatedUser = {
            ...user,
            ecoPoints: newPoints
        }
        await saveUser(updatedUser)

        // Add points ledger entry for audit trail
        await addPointsLedgerEntry({
            userId,
            points: pointChange,
            source: 'admin_adjustment',
            timestamp: new Date().toISOString(),
            metadata: {
                reason,
                adminId,
                action,
                previousPoints: user.ecoPoints,
                newPoints
            },
        })

        return NextResponse.json({
            success: true,
            message: action === 'add' ? `Added ${points} points to user` : `Removed ${points} points from user`,
            previousPoints: user.ecoPoints,
            newPoints,
            pointsChange: pointChange
        })
    } catch (error) {
        console.error('Error modifying points:', error)
        return NextResponse.json({ error: 'Failed to modify points' }, { status: 500 })
    }
}

// PUT - Alias for POST (for compatibility)
export async function PUT(request: NextRequest) {
    return POST(request)
}
