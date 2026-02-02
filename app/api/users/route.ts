import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUser, getCurrentUser, getUserByEmail } from '@/lib/database'
import type { User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json()
    await saveUser(user)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}
