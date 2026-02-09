"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, CheckCircle, Clock, Target } from 'lucide-react'
import { getCurrentUserFromSession } from '@/lib/storage-api'
import type { Assessment } from '@/lib/types'

export default function AssessmentsPage() {
    const router = useRouter()
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
    const [badgesEarned, setBadgesEarned] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const user = getCurrentUserFromSession()
            if (!user) return

            try {
                // Fetch assessments
                const assessmentsRes = await fetch(`/api/assessments?schoolId=${user.school}`)
                const assessmentsData = await assessmentsRes.json()
                setAssessments(assessmentsData)

                // Fetch user's attempts to check completion
                const attemptsRes = await fetch(`/api/assessments/attempt?userId=${user.id}`)
                if (attemptsRes.ok) {
                    const attempts = await attemptsRes.json()
                    // Only count completion if the assessment still exists
                    const validAssessmentIds = new Set(assessmentsData.map((a: Assessment) => a.id))
                    const completed = new Set<string>(attempts
                        .map((a: any) => a.assessmentId)
                        .filter((id: string) => validAssessmentIds.has(id))
                    )
                    setCompletedIds(completed)
                }

                // Get user badges count from storage-api
                const { getCurrentUser } = await import('@/lib/storage-api')
                const userData = await getCurrentUser(user.id)
                if (userData) {
                    setBadgesEarned(userData.badges?.length || 0)
                }
            } catch (error) {
                console.error('Error fetching assessments:', error)
            } finally {
                setLoading(false)
            }
        }

        // Fetch on mount
        fetchData()

        // Refetch when page becomes visible (user returns from assessment)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchData()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const completedCount = completedIds.size
    const totalCount = assessments.length

    return (
        <AuthGuard requiredRole="student">
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />

                <main className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Brain className="h-10 w-10 text-blue-600" />
                            AI Assessments
                        </h1>
                        <p className="text-muted-foreground">
                            Test your knowledge and earn points and badges!
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <Card className="mb-8 border-2 border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle>Your Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                                    <div className="text-xs text-muted-foreground">Available</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
                                    <div className="text-xs text-muted-foreground">Remaining</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{badgesEarned}</div>
                                    <div className="text-xs text-muted-foreground">Badges Earned</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assessments List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading assessments...</p>
                        </div>
                    ) : assessments.length === 0 ? (
                        <Card className="border-2 border-dashed">
                            <CardContent className="text-center py-12">
                                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Assessments Available</h3>
                                <p className="text-muted-foreground">
                                    Your teacher hasn't created any assessments yet. Check back later!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {assessments.map((assessment) => {
                                const isCompleted = completedIds.has(assessment.id)

                                return (
                                    <Card
                                        key={assessment.id}
                                        className={`border-2 shadow-lg hover:shadow-xl transition-shadow relative ${isCompleted ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                                            }`}
                                    >
                                        {isCompleted && (
                                            <div className="absolute top-4 right-4">
                                                <Badge className="bg-green-600">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader>
                                            <CardTitle className="text-xl">{assessment.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{assessment.description}</p>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Info */}
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                    <span>{assessment.questions.length} Questions</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>~{assessment.questions.length * 2} mins</span>
                                                </div>
                                            </div>

                                            {/* Category Badge */}
                                            <div>
                                                <Badge variant="outline" className="capitalize">
                                                    {assessment.category}
                                                </Badge>
                                            </div>

                                            {/* Rewards */}
                                            <div className="p-3 bg-white rounded-lg border">
                                                <div className="text-xs text-muted-foreground mb-1">Rewards</div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Up to {assessment.totalPoints} points</span>
                                                    <span className="text-sm text-blue-600">🏆 {assessment.badgeName}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Button
                                                onClick={() => router.push(`/student/assessments/${assessment.id}`)}
                                                className="w-full"
                                                variant={isCompleted ? 'outline' : 'default'}
                                                disabled={isCompleted}
                                            >
                                                {isCompleted ? 'Already Completed' : 'Start Assessment'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
