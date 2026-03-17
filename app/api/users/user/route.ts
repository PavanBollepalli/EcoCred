import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getUserByEmail } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Helper function to extract college code from email domain
// Now dynamically derives from school name if available, or falls back to email domain
export function getCollegeCodeFromEmail(email: string, schoolName?: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  
  // If school name is provided, use it to derive college code
  if (schoolName) {
    const derivedCode = schoolName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4)
    if (derivedCode.length >= 2) {
      return derivedCode
    }
  }
  
  // Fallback: try to extract from email domain
  if (domain) {
    const domainParts = domain.split('.')
    if (domainParts.length > 0) {
      const prefix = domainParts[0].toUpperCase()
      const knownDomains: Record<string, string> = {
        'vvit': 'VVIT',
        'viva': 'VIVA',
      }
      return knownDomains[prefix] || prefix.substring(0, 4)
    }
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const collegeCode = searchParams.get('collegeCode')

    if (userId) {
      const user = await getCurrentUser(userId, collegeCode ?? undefined)
      return NextResponse.json(user)
    } else if (email) {
      // Get user by email (login lookup)
      const user = await getUserByEmail(email, collegeCode ?? undefined)
      
      if (user) {
        // Validate that the stored collegeCode can be derived from the email
        const derivedCollegeCode = getCollegeCodeFromEmail(email, user.school)
        
        // If stored collegeCode doesn't match derived, allow login but log warning
        if (user.collegeCode && derivedCollegeCode && user.collegeCode !== derivedCollegeCode) {
          console.log(`Login college code mismatch for ${email}: stored=${user.collegeCode}, derived=${derivedCollegeCode}`)
        }
      }
      
      return NextResponse.json(user)
    } else {
      return NextResponse.json({ error: 'Missing userId or email parameter' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
