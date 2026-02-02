import { NextResponse } from 'next/server'
import { initializeDemoData } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await initializeDemoData()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize demo data' }, { status: 500 })
  }
}
