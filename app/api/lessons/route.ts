import { NextRequest, NextResponse } from 'next/server'
import { 
  completeLesson, 
  getUserLessonProgress, 
  getCompletedLessonsCount 
} from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const lessonId = searchParams.get('lessonId')
    const action = searchParams.get('action')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    if (action === 'progress' && lessonId) {
      const progress = await getUserLessonProgress(userId, lessonId)
      return NextResponse.json(progress)
    } else if (action === 'count') {
      const count = await getCompletedLessonsCount(userId)
      return NextResponse.json({ count })
    } else {
      return NextResponse.json({ error: 'Invalid action or missing lessonId' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lesson data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, points } = await request.json()
    
    if (!userId || !lessonId || !points) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await completeLesson(userId, lessonId, points)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 })
  }
}
