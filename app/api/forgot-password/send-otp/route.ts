import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const db = await getDatabase()
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    // Store OTP in database
    await db.collection('password_reset_otps').replaceOne(
      { email },
      {
        email,
        otp,
        expiresAt,
        verified: false,
        createdAt: new Date(),
      },
      { upsert: true }
    )

    // Configure email transporter
    // Uses Gmail SMTP - set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // Send OTP email
    await transporter.sendMail({
      from: `"EcoCred" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'EcoCred - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16a34a; text-align: center;">EcoCred Password Reset</h2>
          <p>Hello <strong>${user.name || 'User'}</strong>,</p>
          <p>You requested a password reset. Use the OTP below to verify your identity:</p>
          <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">EcoCred - Making sustainability fun!</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'OTP sent successfully to your email' })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
