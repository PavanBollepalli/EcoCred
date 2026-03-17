import { NextRequest, NextResponse } from 'next/server'
import { getLessons, getLessonById, saveLesson, deleteLesson, getLessonsByTeacher } from '@/lib/database'
import type { Lesson } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const lessonId = searchParams.get('lessonId')
        const schoolId = searchParams.get('schoolId')
        const teacherId = searchParams.get('teacherId')
        const collegeCode = searchParams.get('collegeCode') || undefined

        if (lessonId) {
            const lesson = await getLessonById(lessonId)
            if (!lesson) {
                return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
            }
            return NextResponse.json(lesson)
        } else if (teacherId) {
            const lessons = await getLessonsByTeacher(teacherId, collegeCode)
            return NextResponse.json(lessons)
        } else {
            const lessons = await getLessons(collegeCode, schoolId || undefined)
            return NextResponse.json(lessons)
        }
    } catch (error) {
        console.error('Error fetching lessons:', error)
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const lesson: Lesson = await request.json()

        // Validate required fields
        if (!lesson.title || !lesson.content || !lesson.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate collegeCode is present
        if (!lesson.collegeCode) {
            return NextResponse.json({ error: 'College code is required' }, { status: 400 })
        }

        // Validate category is one of the allowed values, default to "general" if invalid
        const validCategories = ["planting", "waste", "energy", "water", "aptitude", "general"]
        if (!validCategories.includes(lesson.category)) {
            lesson.category = "general" // Default to General Aptitude
        }

        // Set timestamps and ensure proper structure
        const newLesson: Lesson = {
            ...lesson,
            id: lesson.id || Date.now().toString(),
            isActive: lesson.isActive !== undefined ? lesson.isActive : true,
            createdAt: lesson.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        await saveLesson(newLesson)
        return NextResponse.json({ success: true, lesson: newLesson })
    } catch (error) {
        console.error('Error creating lesson:', error)
        return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const lesson: Lesson = await request.json()

        if (!lesson.id) {
            return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
        }

        // Check if lesson exists
        const existingLesson = await getLessonById(lesson.id)
        if (!existingLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
        }

        // Update with new data while preserving createdAt
        const updatedLesson: Lesson = {
            ...lesson,
            createdAt: existingLesson.createdAt,
            updatedAt: new Date().toISOString(),
        }

        await saveLesson(updatedLesson)
        return NextResponse.json({ success: true, lesson: updatedLesson })
    } catch (error) {
        console.error('Error updating lesson:', error)
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const lessonId = searchParams.get('lessonId')

        if (!lessonId) {
            return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
        }

        await deleteLesson(lessonId)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting lesson:', error)
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
    }
}
