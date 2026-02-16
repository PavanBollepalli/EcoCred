import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VISION_BACKEND_URL = process.env.VISION_BACKEND_URL || 'http://localhost:8000'

/**
 * Proxy endpoint to the Python Vision backend.
 * POST /api/vision/analyze
 * 
 * Accepts multipart form data with:
 *   - file: image file
 *   - category: optional eco-category string
 * 
 * Or JSON with:
 *   - image: base64 encoded image
 *   - category: optional eco-category string
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let backendResponse: Response

    if (contentType.includes('multipart/form-data')) {
      // Forward multipart form data directly
      const formData = await request.formData()
      backendResponse = await fetch(`${VISION_BACKEND_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })
    } else {
      // JSON body with base64 image
      const body = await request.json()
      backendResponse = await fetch(`${VISION_BACKEND_URL}/api/analyze-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.detail || 'Vision backend error' },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Vision proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Vision backend unavailable. Ensure the Python backend is running on port 8000.',
      },
      { status: 503 }
    )
  }
}

/**
 * GET /api/vision/analyze — health check proxy
 */
export async function GET() {
  try {
    const res = await fetch(`${VISION_BACKEND_URL}/api/health`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'unavailable', error: 'Vision backend not reachable' },
      { status: 503 }
    )
  }
}
