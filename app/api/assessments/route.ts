import { NextRequest, NextResponse } from 'next/server'
import { getAssessments, getAssessmentById, saveAssessment, deleteAssessment } from '@/lib/database'
import type { Assessment } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET - Fetch all assessments or a specific assessment by ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const schoolId = searchParams.get('schoolId') || undefined

        if (id) {
            const assessment = await getAssessmentById(id)
            if (!assessment) {
                return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
            }
            return NextResponse.json(assessment)
        } else {
            const assessments = await getAssessments(schoolId)
            return NextResponse.json(assessments)
        }
    } catch (error) {
        console.error('Error fetching assessments:', error)
        return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }
}

// POST - Create a new assessment
export async function POST(request: NextRequest) {
    try {
        const assessment: Assessment = await request.json()

        // Validate required fields
        if (!assessment.title || !assessment.questions || assessment.questions.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Set timestamps and defaults
        const newAssessment: Assessment = {
            ...assessment,
            id: assessment.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            isActive: assessment.isActive !== undefined ? assessment.isActive : true,
            createdAt: assessment.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        await saveAssessment(newAssessment)
        return NextResponse.json({ success: true, assessment: newAssessment })
    } catch (error) {
        console.error('Error creating assessment:', error)
        return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
    }
}

// PUT - Update an existing assessment
export async function PUT(request: NextRequest) {
    try {
        const assessment: Assessment = await request.json()

        if (!assessment.id) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
        }

        // Check if assessment exists
        const existingAssessment = await getAssessmentById(assessment.id)
        if (!existingAssessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
        }

        // Update with new data while preserving createdAt
        const updatedAssessment: Assessment = {
            ...assessment,
            createdAt: existingAssessment.createdAt,
            updatedAt: new Date().toISOString(),
        }

        await saveAssessment(updatedAssessment)
        return NextResponse.json({ success: true, assessment: updatedAssessment })
    } catch (error) {
        console.error('Error updating assessment:', error)
        return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 })
    }
}

// DELETE - Soft delete an assessment
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
        }

        await deleteAssessment(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting assessment:', error)
        return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 })
    }
}
