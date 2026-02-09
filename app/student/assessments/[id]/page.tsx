"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUserFromSession } from '@/lib/storage-api'
import type { Assessment, AssessmentQuestion } from '@/lib/types'

export default function TakeAssessmentPage() {
    const params = useParams()
    const router = useRouter()
    const assessmentId = params.id as string

    const [assessment, setAssessment] = useState<Assessment | null>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const user = getCurrentUserFromSession()
                if (!user) {
                    router.push('/login')
                    return
                }

                // Check if already completed
                const attemptsRes = await fetch(`/api/assessments/attempt?userId=${user.id}`)
                if (attemptsRes.ok) {
                    const attempts = await attemptsRes.json()
                    const alreadyCompleted = attempts.some((a: any) => a.assessmentId === assessmentId)

                    if (alreadyCompleted) {
                        toast.error('You have already completed this assessment')
                        router.push('/student/assessments')
                        return
                    }
                }

                const response = await fetch(`/api/assessments?id=${assessmentId}`)
                const data = await response.json()
                setAssessment(data)
            } catch (error) {
                console.error('Error fetching assessment:', error)
                toast.error('Failed to load assessment')
            } finally {
                setLoading(false)
            }
        }

        fetchAssessment()
    }, [assessmentId, router])

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }))
    }

    const handleNext = () => {
        if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!assessment) return

        // Check if all questions are answered
        const unanswered = assessment.questions.filter(q => !answers[q.id])
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`)
            return
        }

        setIsSubmitting(true)
        try {
            const user = getCurrentUserFromSession()
            const response = await fetch('/api/assessments/attempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    assessmentId: assessment.id,
                    answers,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                // Handle "already completed" error specifically
                if (response.status === 400 && data.error?.includes('already completed')) {
                    toast.error('You have already completed this assessment!', {
                        description: 'Redirecting to assessments list...',
                        duration: 3000,
                    })
                    setTimeout(() => {
                        router.push('/student/assessments')
                    }, 2000)
                    return
                }
                throw new Error(data.error || 'Failed to submit assessment')
            }

            setResults(data)

            toast.success(
                <div>
                    <p className="font-bold">Assessment Completed! 🎉</p>
                    <p>Score: {data.attempt.score}/{data.attempt.maxScore}</p>
                    <p>+{data.pointsEarned} points</p>
                    {data.badgeAwarded && <p>🏆 Badge: {data.badgeName}</p>}
                </div>
            )
        } catch (error) {
            console.error('Error submitting assessment:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to submit assessment')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading assessment...</p>
                </div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
                    <Button onClick={() => router.push('/student/assessments')}>
                        Back to Assessments
                    </Button>
                </div>
            </div>
        )
    }

    // Results View
    if (results) {
        const scorePercentage = (results.attempt.score / results.attempt.maxScore) * 100

        return (
            <AuthGuard requiredRole="student">
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                    <Navigation />

                    <main className="container mx-auto px-4 py-8 max-w-4xl">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/student/assessments')}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assessments
                        </Button>

                        <Card className="border-2 border-green-200 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="text-center text-3xl">Assessment Complete!</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center space-y-6">
                                <div className="text-6xl mb-4">
                                    {scorePercentage >= 70 ? '🎉' : '📚'}
                                </div>

                                <div>
                                    <div className="text-5xl font-bold mb-2">
                                        {results.attempt.score}/{results.attempt.maxScore}
                                    </div>
                                    <div className="text-xl text-muted-foreground">
                                        {scorePercentage.toFixed(0)}% Score
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">+{results.pointsEarned}</div>
                                        <div className="text-sm text-muted-foreground">Points Earned</div>
                                    </div>
                                    {results.badgeAwarded && (
                                        <div className="p-4 bg-yellow-50 rounded-lg">
                                            <div className="text-2xl">🏆</div>
                                            <div className="text-sm font-semibold">{results.badgeName}</div>
                                        </div>
                                    )}
                                </div>

                                {scorePercentage < 70 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm">
                                            You need 70% or higher to earn the badge. Keep studying and try another assessment!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detailed Results */}
                        <Card className="border-2 border-blue-200">
                            <CardHeader>
                                <CardTitle>Detailed Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {results.attempt.results.map((result: any, index: number) => (
                                    <div
                                        key={result.questionId}
                                        className={`p-4 rounded-lg border-2 ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-2">
                                            {result.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-semibold mb-2">Q{index + 1}. {result.question}</div>
                                                <div className="text-sm space-y-1">
                                                    <div>
                                                        <span className="text-muted-foreground">Your answer: </span>
                                                        <span className={result.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700'}>
                                                            {result.userAnswer}
                                                        </span>
                                                    </div>
                                                    {!result.isCorrect && (
                                                        <div>
                                                            <span className="text-muted-foreground">Correct answer: </span>
                                                            <span className="text-green-700 font-semibold">{result.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <strong>Explanation:</strong> {result.explanation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </main>

                    <Footer />
                </div>
            </AuthGuard>
        )
    }

    // Assessment Taking View
    const currentQuestion = assessment.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100
    const answeredCount = Object.keys(answers).length

    return (
        <AuthGuard requiredRole="student">
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />

                <main className="container mx-auto px-4 py-8 max-w-4xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/student/assessments')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Assessments
                    </Button>

                    {/* Header */}
                    <Card className="mb-6 border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>{assessment.title}</CardTitle>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
                                <span>Answered: {answeredCount}/{assessment.questions.length}</span>
                            </div>
                            <Progress value={progress} className="h-2 mt-2" />
                        </CardHeader>
                    </Card>

                    {/* Question */}
                    <Card className="mb-6 border-2 border-blue-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Q{currentQuestionIndex + 1}. {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[currentQuestion.id] || ''}
                                onValueChange={(value: string) => handleAnswerChange(currentQuestion.id, value)}
                            >
                                {currentQuestion.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                            {String.fromCharCode(65 + index)}. {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="outline"
                            className="flex-1"
                        >
                            Previous
                        </Button>

                        {currentQuestionIndex < assessment.questions.length - 1 ? (
                            <Button onClick={handleNext} className="flex-1">
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || answeredCount < assessment.questions.length}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Assessment'
                                )}
                            </Button>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
