import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

interface AnalysisResult {
    detectedObjects: string[]
    relevanceScore: number
    isInternetImage?: boolean
    isAIGenerated?: boolean
    reasoning: string
}

const CATEGORY_PROMPTS: Record<string, string> = {
    planting: `Look for: trees, saplings, plants, seeds, soil, gardening tools, planting activity, nursery, potted plants.
High score indicators: Active planting, tree saplings, gardening activity.
Low score indicators: No vegetation, unrelated activities.`,

    waste: `Look for: recycling bins, segregated waste, garbage cleanup, composting, waste collection, eco-bags, plastic collection.
High score indicators: Proper waste segregation, cleanup activity, recycling.
Low score indicators: Littering, mixed waste, no cleanup activity.`,

    energy: `Look for: LED bulbs, solar panels, turned off lights/appliances, energy-efficient devices, power saving.
High score indicators: Solar installation, LED usage, energy conservation activity.
Low score indicators: Wasteful energy use, no energy-related elements.`,

    water: `Look for: rainwater harvesting, closed taps, water-saving devices, water conservation, bucket usage, drip irrigation.
High score indicators: Water harvesting setup, conservation activity, efficient water use.
Low score indicators: Water wastage, no water-related elements.`
}

// Helper function to get MIME type from file extension
function getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop()
    const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }
    return mimeTypes[ext || ''] || 'image/jpeg'
}

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, taskCategory, taskTitle } = await request.json()

        console.log('Analyzing image:', { imageUrl, taskCategory, taskTitle })

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
        }

        if (!taskCategory) {
            return NextResponse.json({ error: 'Task category is required' }, { status: 400 })
        }

        // Get category-specific prompt
        const categoryPrompt = CATEGORY_PROMPTS[taskCategory] || CATEGORY_PROMPTS.planting

        // Construct the image URL for analysis
        let imageContent: any

        if (imageUrl.startsWith('/uploads')) {
            // Local image - read file and convert to base64
            try {
                const filePath = join(process.cwd(), 'public', imageUrl)
                console.log('Reading local file:', filePath)
                const imageBuffer = await readFile(filePath)
                const base64Image = imageBuffer.toString('base64')
                const mimeType = getMimeType(imageUrl)

                imageContent = {
                    type: "image_url",
                    image_url: {
                        url: `data:${mimeType};base64,${base64Image}`
                    }
                }
                console.log('Converted to base64, size:', base64Image.length)
            } catch (fileError) {
                console.error('Failed to read local file:', fileError)
                return NextResponse.json({
                    success: true,
                    analysis: {
                        detectedObjects: ["Could not read image"],
                        relevanceScore: null,
                        reasoning: "Image file could not be read. Teacher will review manually."
                    },
                    fallback: true
                })
            }
        } else if (imageUrl.startsWith('http')) {
            // External URL - use directly
            imageContent = {
                type: "image_url",
                image_url: {
                    url: imageUrl
                }
            }
        } else {
            // Unknown format
            return NextResponse.json({
                success: true,
                analysis: {
                    detectedObjects: ["Unknown image format"],
                    relevanceScore: null,
                    reasoning: "Image format not supported. Teacher will review manually."
                },
                fallback: true
            })
        }

        const systemPrompt = `You are an AI assistant that verifies environmental task submissions for a school eco-credits program called EcoCred.

Your job is to analyze images submitted by students as evidence for completing environmental tasks.

For this task category "${taskCategory}" (Task: "${taskTitle || 'Environmental Task'}"):
${categoryPrompt}

IMPORTANT: You must also detect if the image is:
1. An internet/stock image (commonly found online, stock photos, etc.)
2. An AI-generated image (unrealistic, perfect lighting, strange artifacts, etc.)

Respond ONLY with a valid JSON object in this exact format:
{
  "detectedObjects": ["list", "of", "detected", "objects"],
  "relevanceScore": 0-100,
  "isInternetImage": true/false,
  "isAIGenerated": true/false,
  "reasoning": "Brief explanation of why this score was given"
}

Be fair but accurate. If the image clearly shows the environmental activity, give a high score (80-100). 
If it's partially relevant, give a medium score (50-79).
If it's not relevant at all, give a low score (0-49).

If the image appears to be an internet stock photo or AI-generated, set relevanceScore to 0 regardless of content.`

        const payload = {
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image submitted as evidence for the task: "${taskTitle || taskCategory}". What do you see and how relevant is it to the task?`
                        },
                        imageContent
                    ]
                }
            ],
            max_tokens: 500
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": request.nextUrl.origin || "http://localhost:3000",
                "X-Title": "EcoCred",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('OpenRouter Vision API error:', response.status, errorText)

            // Return a fallback response so submission still works
            return NextResponse.json({
                success: true,
                analysis: {
                    detectedObjects: ["Unable to analyze"],
                    relevanceScore: null,
                    reasoning: "Image analysis temporarily unavailable. Teacher will review manually."
                },
                fallback: true
            })
        }

        const data = await response.json()
        const aiResponse = data.choices?.[0]?.message?.content

        if (!aiResponse) {
            throw new Error('No response from AI model')
        }

        // Parse the JSON response from the AI
        let analysis: AnalysisResult
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('No JSON found in response')
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse)
            // Provide a default analysis if parsing fails
            analysis = {
                detectedObjects: ["Analysis completed"],
                relevanceScore: 70,
                reasoning: aiResponse.substring(0, 200)
            }
        }

        // CRITICAL FIX: Force confidence to 0 if internet image or AI-generated
        const isInternetImage = analysis.isInternetImage === true
        const isAIGenerated = analysis.isAIGenerated === true

        if (isInternetImage || isAIGenerated) {
            // Override the confidence score to 0
            analysis.relevanceScore = 0
            analysis.reasoning = (isInternetImage ? "Internet/stock image detected. " : "AI-generated image detected. ") + analysis.reasoning
            console.log('Image validation: Detected problematic image', { isInternetImage, isAIGenerated })
        } else {
            // Ensure score is within bounds for legitimate images
            analysis.relevanceScore = Math.max(0, Math.min(100, analysis.relevanceScore || 0))
        }

        return NextResponse.json({
            success: true,
            analysis
        })

    } catch (error) {
        console.error('Image analysis error:', error)

        // Return fallback so submission still works
        return NextResponse.json({
            success: true,
            analysis: {
                detectedObjects: ["Analysis error"],
                relevanceScore: null,
                reasoning: "Could not analyze image. Teacher will review manually."
            },
            fallback: true
        })
    }
}
