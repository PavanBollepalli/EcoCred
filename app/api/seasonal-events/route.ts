import { NextRequest, NextResponse } from 'next/server'
import { getSeasonalEvents, createSeasonalEvent } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collegeCode = searchParams.get('collegeCode') || undefined
    const events = await getSeasonalEvents(collegeCode)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching seasonal events:', error)
    return NextResponse.json({ error: 'Failed to fetch seasonal events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Validate collegeCode is present
    if (!eventData.collegeCode) {
      return NextResponse.json({ error: 'College code is required' }, { status: 400 })
    }
    
    const event = await createSeasonalEvent(eventData)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating seasonal event:', error)
    return NextResponse.json({ error: 'Failed to create seasonal event' }, { status: 500 })
  }
}
