import { NextRequest, NextResponse } from 'next/server'
import { 
  getSubmissions, 
  saveSubmission, 
  getSubmissionsByStudent, 
  getSubmissionsByTask 
} from '@/lib/database'
import type { Submission } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const taskId = searchParams.get('taskId')
    const collegeCode = searchParams.get('collegeCode') || undefined

    if (studentId) {
      const submissions = await getSubmissionsByStudent(studentId, collegeCode)
      return NextResponse.json(submissions)
    } else if (taskId) {
      const submissions = await getSubmissionsByTask(taskId, collegeCode)
      return NextResponse.json(submissions)
    } else {
      const submissions = await getSubmissions(collegeCode)
      return NextResponse.json(submissions)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const submission: Submission = await request.json()
    
    // Validate collegeCode is present
    if (!submission.collegeCode) {
      return NextResponse.json({ error: 'College code is required' }, { status: 400 })
    }
    
    await saveSubmission(submission)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }
}
