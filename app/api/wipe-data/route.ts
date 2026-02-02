import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const db = await getDatabase()
    
    // Delete all collections
    await db.collection('users').deleteMany({})
    await db.collection('tasks').deleteMany({})
    await db.collection('submissions').deleteMany({})
    await db.collection('schools').deleteMany({})
    await db.collection('announcements').deleteMany({})
    await db.collection('calendarEvents').deleteMany({})
    await db.collection('seasonalEvents').deleteMany({})
    await db.collection('imageUploads').deleteMany({})
    await db.collection('globalStats').deleteMany({})
    
    console.log('All data wiped from MongoDB')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All data has been wiped from MongoDB' 
    })
  } catch (error) {
    console.error('Error wiping data:', error)
    return NextResponse.json({ 
      error: 'Failed to wipe data' 
    }, { status: 500 })
  }
}
