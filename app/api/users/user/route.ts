import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getUserByEmail } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (userId) {
      const user = await getCurrentUser(userId)
      return NextResponse.json(user)
    } else if (email) {
      const user = await getUserByEmail(email)
      return NextResponse.json(user)
    } else {
      return NextResponse.json({ error: 'Missing userId or email parameter' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
