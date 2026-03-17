import { NextRequest, NextResponse } from 'next/server'
import { getBadges, getBadgeById, saveBadge, deleteBadge } from '@/lib/database'
import type { Badge } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET - Fetch all badges or filter by schoolId/collegeCode
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const schoolId = searchParams.get('schoolId') || undefined
        const collegeCode = searchParams.get('collegeCode') || undefined

        const badges = await getBadges(collegeCode, schoolId)
        return NextResponse.json(badges)
    } catch (error) {
        console.error('Error fetching badges:', error)
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
    }
}

// POST - Create or update a badge
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.requirement) {
            return NextResponse.json(
                { error: 'Name and requirement are required' },
                { status: 400 }
            )
        }

        // Validate collegeCode is present for teacher-created badges
        if (!body.collegeCode) {
            return NextResponse.json({ error: 'College code is required' }, { status: 400 })
        }

        const badge: Badge = {
            id: body.id || `badge-${Date.now()}`,
            name: body.name,
            description: body.description || '',
            icon: body.icon || 'Award',
            color: body.color || 'bg-green-500',
            requirement: body.requirement,
            createdBy: body.createdBy || 'system',
            schoolId: body.schoolId,
            collegeCode: body.collegeCode,
            isActive: body.isActive !== false,
            createdAt: body.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await saveBadge(badge)

        return NextResponse.json({ success: true, badge })
    } catch (error) {
        console.error('Error saving badge:', error)
        return NextResponse.json({ error: 'Failed to save badge' }, { status: 500 })
    }
}

// DELETE - Delete a badge by ID
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const badgeId = searchParams.get('id')

        if (!badgeId) {
            return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
        }

        await deleteBadge(badgeId)
        return NextResponse.json({ success: true, message: 'Badge deleted' })
    } catch (error) {
        console.error('Error deleting badge:', error)
        return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 })
    }
}
