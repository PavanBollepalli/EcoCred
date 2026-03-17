import { NextRequest, NextResponse } from 'next/server'
import { deleteUser, getCurrentUser } from '@/lib/database'

export const dynamic = 'force-dynamic'

// DELETE - Delete a user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await getCurrentUser(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin users through this endpoint for safety
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users through this endpoint' }, { status: 403 })
    }

    const deleted = await deleteUser(userId)

    if (deleted) {
      return NextResponse.json({ success: true, message: 'User deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

// GET - Get a specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const collegeCode = searchParams.get('collegeCode')
    const user = await getCurrentUser(userId, collegeCode ?? undefined)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
 