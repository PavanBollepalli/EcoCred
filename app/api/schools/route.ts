import { NextRequest, NextResponse } from 'next/server'
import { getSchools, createSchool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const schools = await getSchools()
    return NextResponse.json(schools)
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const schoolData = await request.json()
    const school = await createSchool(schoolData)
    return NextResponse.json(school, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 })
  }
}
