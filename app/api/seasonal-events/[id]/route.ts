import { NextRequest, NextResponse } from 'next/server'
import { updateSeasonalEvent, deleteSeasonalEvent } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventData = await request.json()
    const event = await updateSeasonalEvent(params.id, eventData)
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Error updating seasonal event:', error)
    return NextResponse.json({ error: 'Failed to update seasonal event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteSeasonalEvent(params.id)
    return NextResponse.json({ message: 'Seasonal event deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting seasonal event:', error)
    return NextResponse.json({ error: 'Failed to delete seasonal event' }, { status: 500 })
  }
}
