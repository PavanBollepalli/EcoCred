import { NextRequest, NextResponse } from 'next/server'
import {
    saveAssessmentAttempt,
    getAssessmentById,
    hasCompletedAssessment,
    getUsers,
    saveUser,
    addPointsLedgerEntry,
    logEvent,
    getBadges,
    saveBadge,
    getAssessmentAttempts
} from '@/lib/database'
import type { AssessmentAttempt } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET - Fetch assessment attempts for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const attempts = await getAssessmentAttempts(userId)
        return NextResponse.json(attempts)
    } catch (error) {
        console.error('Error fetching assessment attempts:', error)
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }
}

// POST - Submit an assessment attempt
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, assessmentId, answers } = body

        if (!userId || !assessmentId || !answers) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if already completed
        const alreadyCompleted = await hasCompletedAssessment(userId, assessmentId)
        if (alreadyCompleted) {
            return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })
        }

        // Get assessment
        const assessment = await getAssessmentById(assessmentId)
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
        }

        // Calculate score
        let score = 0
        const maxScore = assessment.totalPoints
        const results: any[] = []

        assessment.questions.forEach((question) => {
            const userAnswer = answers[question.id]
            const isCorrect = String(userAnswer) === String(question.correctAnswer)

            if (isCorrect) {
                score += question.points
            }

            results.push({
                questionId: question.id,
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation,
                points: isCorrect ? question.points : 0,
            })
        })

        // Calculate points earned (proportional to score)
        const pointsEarned = Math.round((score / maxScore) * assessment.totalPoints)

        // Save attempt
        const attempt: AssessmentAttempt = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId,
            assessmentId,
            answers,
            score,
            maxScore,
            completedAt: new Date().toISOString(),
            pointsEarned,
            badgeAwarded: false,
        }

        await saveAssessmentAttempt(attempt)

        // Get user for updates
        const users = await getUsers()
        const user = users.find(u => u.id === userId)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Add points ledger entry
        await addPointsLedgerEntry({
            userId,
            points: pointsEarned,
            source: 'assessment',
            sourceId: assessmentId,
            timestamp: new Date().toISOString(),
            metadata: {
                assessmentTitle: assessment.title,
                score,
                maxScore,
            },
        })

        // Award badge if score is high enough (e.g., 70% or higher)
        let badgeAwarded = false
        const scorePercentage = (score / maxScore) * 100

        if (scorePercentage >= 70) {
            // Check if badge exists, create if not
            const badges = await getBadges()
            let badge = badges.find(b => b.name === assessment.badgeName)

            if (!badge) {
                // Create the badge
                badge = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: assessment.badgeName,
                    description: `Completed the ${assessment.title} assessment with ${scorePercentage.toFixed(0)}% score`,
                    icon: 'Award',
                    color: 'bg-blue-500',
                    requirement: {
                        type: 'points',
                        value: 0, // Auto-awarded
                    },
                    createdBy: 'system',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                }
                await saveBadge(badge)
            }

            // Award badge to user if they don't have it
            if (!user.badges.includes(assessment.badgeName)) {
                badgeAwarded = true
                attempt.badgeAwarded = true
            }
        }

        // Update user with points and badge (single save operation)
        const updatedUser = {
            ...user,
            ecoPoints: user.ecoPoints + pointsEarned,
            badges: badgeAwarded ? [...user.badges, assessment.badgeName] : user.badges,
        }
        await saveUser(updatedUser)

        // Log event
        await logEvent({
            userId,
            eventType: 'assessment_completed',
            eventData: {
                assessmentId,
                assessmentTitle: assessment.title,
                score,
                maxScore,
                pointsEarned,
                badgeAwarded,
            },
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({
            success: true,
            attempt: {
                ...attempt,
                results,
            },
            pointsEarned,
            badgeAwarded,
            badgeName: badgeAwarded ? assessment.badgeName : undefined,
        })
    } catch (error) {
        console.error('Error submitting assessment attempt:', error)
        return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 })
    }
}
