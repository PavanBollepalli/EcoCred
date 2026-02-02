import { NextRequest, NextResponse } from 'next/server'
import { updateSchool, deleteSchool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolData = await request.json()
    await updateSchool(params.id, schoolData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteSchool(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
  }
}
