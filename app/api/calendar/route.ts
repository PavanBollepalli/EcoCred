import { NextRequest, NextResponse } from 'next/server'
import { getCalendarEvents, createCalendarEvent } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const collegeCode = searchParams.get('collegeCode') || undefined
    const schoolId = searchParams.get('schoolId') || undefined
    const events = await getCalendarEvents(collegeCode, schoolId)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Validate collegeCode is present
    if (!eventData.collegeCode) {
      return NextResponse.json({ error: 'College code is required' }, { status: 400 })
    }
    
    const event = await createCalendarEvent(eventData)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
  }
}
