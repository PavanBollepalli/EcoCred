import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUser, getCurrentUser, getUserByEmail } from '@/lib/database'
import type { User } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Helper function to extract college code from email domain
// Now dynamically derives from school name if available, or falls back to email domain
export function getCollegeCodeFromEmail(email: string, schoolName?: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  
  // If school name is provided, use it to derive college code
  if (schoolName) {
    // Convert school name to uppercase and use first 4 characters as college code
    const derivedCode = schoolName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4)
    if (derivedCode.length >= 2) {
      return derivedCode
    }
  }
  
  // Fallback: try to extract from email domain
  // @vvit.net → VVIT, @viva.net → VIVA, or use domain prefix
  if (domain) {
    const domainParts = domain.split('.')
    if (domainParts.length > 0) {
      const prefix = domainParts[0].toUpperCase()
      // If it's a known domain, use full name; otherwise use first 4 chars of domain
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
    const { searchParams } = new URL(request.url)
    const collegeCode = searchParams.get('collegeCode')
    const users = await getUsers(collegeCode ?? undefined)
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json()
    
    // Get college code from school name or email
    const collegeCodeFromSchool = user.school ? getCollegeCodeFromEmail(user.email, user.school) : null
    const collegeCodeFromEmail = getCollegeCodeFromEmail(user.email)
    
    // Use school-derived code if available, otherwise fall back to email-derived
    const finalCollegeCode = collegeCodeFromSchool || collegeCodeFromEmail
    
    if (!finalCollegeCode) {
      return NextResponse.json({ error: 'Could not determine college code from email or school name' }, { status: 400 })
    }
    
    // If user provides collegeCode, validate it matches our derived code (optional validation)
    if (user.collegeCode && user.collegeCode !== finalCollegeCode) {
      // Allow it but log a warning - could be admin override
      console.log(`College code override: ${user.collegeCode} -> ${finalCollegeCode}`)
    }
    
    // Set the validated collegeCode
    user.collegeCode = finalCollegeCode
    
    await saveUser(user)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}
