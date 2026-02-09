import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Generate assessment questions using AI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { topic, syllabus, questionCount = 5, category = 'energy' } = body

        if (!topic || !syllabus) {
            return NextResponse.json({ error: 'Topic and syllabus are required' }, { status: 400 })
        }

        // Call OpenRouter API (using existing pattern from chat/analyze-image routes)
        const prompt = `You are an educational assessment generator. Create ${questionCount} multiple-choice questions based on the following:

Topic: ${topic}
Syllabus: ${syllabus}

Generate questions that test understanding of the key concepts. For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer (index 0-3)
4. A brief explanation of why that answer is correct

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation here",
      "points": 10
    }
  ]
}

Make questions educational, clear, and appropriate for students learning about environmental topics.`

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'EcoCred Assessment Generator',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        })

        if (!aiResponse.ok) {
            throw new Error(`OpenRouter API error: ${aiResponse.statusText}`)
        }

        const aiData = await aiResponse.json()
        const content = aiData.choices[0]?.message?.content

        if (!content) {
            throw new Error('No content received from AI')
        }

        // Parse JSON from AI response
        let parsedQuestions
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
            const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
            parsedQuestions = JSON.parse(jsonString)
        } catch (parseError) {
            console.error('Failed to parse AI response:', content)
            throw new Error('Failed to parse AI-generated questions')
        }

        // Validate and format questions
        const questions = parsedQuestions.questions.map((q: any, index: number) => ({
            id: `q${index + 1}`,
            question: q.question,
            type: 'mcq' as const,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 10,
        }))

        // Calculate total points
        const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0)

        return NextResponse.json({
            success: true,
            questions,
            totalPoints,
            metadata: {
                topic,
                category,
                generatedAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error('Error generating assessment:', error)
        return NextResponse.json({
            error: 'Failed to generate assessment',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
    }
}
