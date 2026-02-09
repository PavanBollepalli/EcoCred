"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUserFromSession } from '@/lib/storage-api'
import type { Assessment, AssessmentQuestion } from '@/lib/types'

export default function CreateAssessmentPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [topic, setTopic] = useState('')
    const [syllabus, setSyllabus] = useState('')
    const [category, setCategory] = useState<'planting' | 'waste' | 'energy' | 'water'>('energy')
    const [questionCount, setQuestionCount] = useState(5)
    const [badgeName, setBadgeName] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [generatedQuestions, setGeneratedQuestions] = useState<AssessmentQuestion[]>([])

    const handleGenerate = async () => {
        if (!topic || !syllabus) {
            toast.error('Please fill in topic and syllabus')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/assessments/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, syllabus, questionCount, category }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate assessment')
            }

            setGeneratedQuestions(data.questions)
            toast.success(`Generated ${data.questions.length} questions!`)
        } catch (error) {
            console.error('Error generating assessment:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate assessment')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!title || generatedQuestions.length === 0) {
            toast.error('Please provide a title and generate questions first')
            return
        }

        if (!badgeName) {
            toast.error('Please provide a badge name for completion')
            return
        }

        setIsSaving(true)
        try {
            const user = getCurrentUserFromSession()
            const totalPoints = generatedQuestions.reduce((sum, q) => sum + q.points, 0)

            const assessment: Assessment = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title,
                topic,
                description: `Assessment on ${topic}`,
                category,
                questions: generatedQuestions,
                totalPoints,
                badgeName,
                createdBy: user?.id || '',
                schoolId: user?.school,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            const response = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assessment),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save assessment')
            }

            toast.success('Assessment created successfully!')
            router.push('/teacher')
        } catch (error) {
            console.error('Error saving assessment:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save assessment')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <AuthGuard requiredRole="teacher">
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />

                <main className="container mx-auto px-4 py-8 max-w-4xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/teacher')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Brain className="h-10 w-10 text-blue-600" />
                            Create AI Assessment
                        </h1>
                        <p className="text-muted-foreground">
                            Use AI to generate custom assessments tailored to your syllabus
                        </p>
                    </div>

                    {/* Configuration Form */}
                    <Card className="mb-6 border-2 border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle>Assessment Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Assessment Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Energy Conservation Quiz"
                                />
                            </div>

                            <div>
                                <Label htmlFor="topic">Topic *</Label>
                                <Input
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Renewable Energy Sources"
                                />
                            </div>

                            <div>
                                <Label htmlFor="syllabus">Syllabus/Learning Objectives *</Label>
                                <Textarea
                                    id="syllabus"
                                    value={syllabus}
                                    onChange={(e) => setSyllabus(e.target.value)}
                                    placeholder="Describe the key concepts, topics, and learning objectives..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="energy">Energy</SelectItem>
                                            <SelectItem value="waste">Waste Management</SelectItem>
                                            <SelectItem value="water">Water Conservation</SelectItem>
                                            <SelectItem value="planting">Tree Planting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="questionCount">Number of Questions</Label>
                                    <Input
                                        id="questionCount"
                                        type="number"
                                        min={3}
                                        max={15}
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="badgeName">Badge Name (awarded on 70%+ score) *</Label>
                                <Input
                                    id="badgeName"
                                    value={badgeName}
                                    onChange={(e) => setBadgeName(e.target.value)}
                                    placeholder="e.g., Energy Expert"
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic || !syllabus}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating Questions...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Questions with AI
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Generated Questions Preview */}
                    {generatedQuestions.length > 0 && (
                        <Card className="mb-6 border-2 border-green-200 shadow-lg">
                            <CardHeader>
                                <CardTitle>Generated Questions ({generatedQuestions.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {generatedQuestions.map((question, index) => (
                                    <div key={question.id} className="p-4 bg-white rounded-lg border">
                                        <div className="font-semibold mb-2">
                                            Q{index + 1}. {question.question}
                                        </div>
                                        <div className="space-y-1 mb-2">
                                            {question.options?.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`p-2 rounded ${optIndex === question.correctAnswer
                                                            ? 'bg-green-100 border border-green-300'
                                                            : 'bg-gray-50'
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + optIndex)}. {option}
                                                    {optIndex === question.correctAnswer && ' ✓'}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <strong>Explanation:</strong> {question.explanation}
                                        </div>
                                        <div className="text-sm text-blue-600 mt-2">
                                            Points: {question.points}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Assessment'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => setGeneratedQuestions([])}
                                        variant="outline"
                                        disabled={isSaving}
                                    >
                                        Clear & Regenerate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}
