import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, createAnnouncement } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const schoolId = searchParams.get('schoolId') || undefined
    const targetAudience = searchParams.get('targetAudience') || undefined
    const announcements = await getAnnouncements(schoolId, targetAudience)
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const announcementData = await request.json()
    const announcement = await createAnnouncement(announcementData)
    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
