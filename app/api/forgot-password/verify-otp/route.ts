import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const db = await getDatabase()
    const record = await db.collection('password_reset_otps').findOne({ email })

    if (!record) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 404 })
    }

    // Check expiry
    if (new Date() > new Date(record.expiresAt)) {
      await db.collection('password_reset_otps').deleteOne({ email })
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    // Check OTP match
    if (record.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    // Mark as verified
    await db.collection('password_reset_otps').updateOne(
      { email },
      { $set: { verified: true } }
    )

    return NextResponse.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP. Please try again.' }, { status: 500 })
  }
}
