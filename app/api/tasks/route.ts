import { NextRequest, NextResponse } from 'next/server'
import { getTasks, saveTask, getTaskById } from '@/lib/database'
import type { Task } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get('taskId')
    const collegeCode = searchParams.get('collegeCode')

    if (taskId) {
      const task = await getTaskById(taskId, collegeCode ?? undefined)
      return NextResponse.json(task)
    } else {
      const tasks = await getTasks(collegeCode ?? undefined)
      return NextResponse.json(tasks)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const task: Task = await request.json()
    await saveTask(task)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 })
  }
}
