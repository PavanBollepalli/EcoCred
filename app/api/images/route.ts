import { NextRequest, NextResponse } from 'next/server'
import { getImageUploads } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const uploadedBy = searchParams.get('uploadedBy') || undefined
    const taskId = searchParams.get('taskId') || undefined
    const submissionId = searchParams.get('submissionId') || undefined
    const isPublic = searchParams.get('isPublic') === 'true' ? true : undefined

    const filters = {
      uploadedBy,
      taskId,
      submissionId,
      isPublic
    }

    const images = await getImageUploads(filters)
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}
