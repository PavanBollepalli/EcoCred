import { NextRequest, NextResponse } from 'next/server'
import { getPointsLedger, getPointsSummary } from '@/lib/database'

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
