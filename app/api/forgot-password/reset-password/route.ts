import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if OTP was verified
    const otpRecord = await db.collection('password_reset_otps').findOne({ email, verified: true })

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not verified. Please verify your OTP first.' }, { status: 400 })
    }

    // Check expiry (extra safety check)
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.collection('password_reset_otps').deleteOne({ email })
      return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 400 })
    }

    // Update password
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { password: newPassword } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Clean up OTP record
    await db.collection('password_reset_otps').deleteOne({ email })

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 })
  }
}
