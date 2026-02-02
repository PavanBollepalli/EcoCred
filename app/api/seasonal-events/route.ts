import { NextRequest, NextResponse } from 'next/server'
import { getSeasonalEvents, createSeasonalEvent } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const events = await getSeasonalEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching seasonal events:', error)
    return NextResponse.json({ error: 'Failed to fetch seasonal events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    const event = await createSeasonalEvent(eventData)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating seasonal event:', error)
    return NextResponse.json({ error: 'Failed to create seasonal event' }, { status: 500 })
  }
}
