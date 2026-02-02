import { NextRequest, NextResponse } from 'next/server'
import { saveImageUpload } from '@/lib/database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'task-images')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${sanitizedName}`
    const filePath = join(uploadsDir, fileName)
    
    // Save file to public/uploads
    await writeFile(filePath, buffer)
    
    // Generate public URL
    const imageUrl = `/uploads/task-images/${fileName}`
    
    // Get user info from request
    const uploadedBy = formData.get('uploadedBy') as string || 'anonymous'
    const taskId = formData.get('taskId') as string || undefined
    const submissionId = formData.get('submissionId') as string || undefined
    
    // Save image metadata to MongoDB
    const imageRecord = await saveImageUpload({
      url: imageUrl,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      taskId,
      submissionId,
      isPublic: true
    })
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      imageId: imageRecord.id
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
      { status: 500 }
    )
  }
}
