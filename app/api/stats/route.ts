import { NextRequest, NextResponse } from 'next/server'
import { getGlobalStats, updateGlobalStats } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getGlobalStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats = await request.json()
    await updateGlobalStats(stats)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update global stats' }, { status: 500 })
  }
}
