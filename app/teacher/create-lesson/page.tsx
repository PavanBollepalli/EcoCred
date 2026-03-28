"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, GripVertical, BookOpen, HelpCircle, Lightbulb } from "lucide-react"
import { getCurrentUserFromSession, saveLesson, getLessonById, updateLesson } from "@/lib/storage-api"
import type { Lesson, LessonSection, QuizQuestion } from "@/lib/storage-api"

export default function CreateLessonPage() {
    return (
        <AuthGuard requiredRole="teacher">
            <CreateLessonForm />
        </AuthGuard>
    )
}

function CreateLessonForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')
    const isEditing = !!editId

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        duration: "",
        points: "",
        coverImage: "",
        introduction: "",
    })

    const [sections, setSections] = useState<LessonSection[]>([
        { title: "", content: [""] }
    ])

    const [tips, setTips] = useState<string[]>([""])

    const [quiz, setQuiz] = useState<QuizQuestion[]>([
        { question: "", options: ["", "", "", ""], correct: 0 }
    ])

    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(isEditing)

    // Load existing lesson if editing
    useEffect(() => {
        const loadLesson = async () => {
            if (editId) {
                try {
                    const lesson = await getLessonById(editId)
                    if (lesson) {
                        setFormData({
                            title: lesson.title,
                            description: lesson.description,
                            category: lesson.category,
                            duration: lesson.duration,
                            points: lesson.points.toString(),
                            coverImage: lesson.coverImage,
                            introduction: lesson.content.introduction,
                        })
                        setSections(lesson.content.sections.length > 0 ? lesson.content.sections : [{ title: "", content: [""] }])
                        setTips(lesson.content.tips.length > 0 ? lesson.content.tips : [""])
                        setQuiz(lesson.content.quiz.length > 0 ? lesson.content.quiz : [{ question: "", options: ["", "", "", ""], correct: 0 }])
                    }
                } catch (err) {
                    console.error('Error loading lesson:', err)
                    setError("Failed to load lesson for editing")
                } finally {
                    setIsLoading(false)
                }
            }
        }
        loadLesson()
    }, [editId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleCategoryChange = (value: string) => {
        setFormData({
            ...formData,
            category: value,
        })
    }

    // Section management
    const addSection = () => {
        setSections([...sections, { title: "", content: [""] }])
    }

    const removeSection = (index: number) => {
        if (sections.length > 1) {
            setSections(sections.filter((_, i) => i !== index))
        }
    }

    const updateSectionTitle = (index: number, title: string) => {
        const newSections = [...sections]
        newSections[index].title = title
        setSections(newSections)
    }

    const addSectionContent = (sectionIndex: number) => {
        const newSections = [...sections]
        newSections[sectionIndex].content.push("")
        setSections(newSections)
    }

    const updateSectionContent = (sectionIndex: number, contentIndex: number, value: string) => {
        const newSections = [...sections]
        newSections[sectionIndex].content[contentIndex] = value
        setSections(newSections)
    }

    const removeSectionContent = (sectionIndex: number, contentIndex: number) => {
        const newSections = [...sections]
        if (newSections[sectionIndex].content.length > 1) {
            newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== contentIndex)
            setSections(newSections)
        }
    }

    // Tips management
    const addTip = () => {
        setTips([...tips, ""])
    }

    const updateTip = (index: number, value: string) => {
        const newTips = [...tips]
        newTips[index] = value
        setTips(newTips)
    }

    const removeTip = (index: number) => {
        if (tips.length > 1) {
            setTips(tips.filter((_, i) => i !== index))
        }
    }

    // Quiz management
    const addQuestion = () => {
        setQuiz([...quiz, { question: "", options: ["", "", "", ""], correct: 0 }])
    }

    const removeQuestion = (index: number) => {
        if (quiz.length > 1) {
            setQuiz(quiz.filter((_, i) => i !== index))
        }
    }

    const updateQuestionText = (index: number, question: string) => {
        const newQuiz = [...quiz]
        newQuiz[index].question = question
        setQuiz(newQuiz)
    }

    const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuiz = [...quiz]
        newQuiz[questionIndex].options[optionIndex] = value
        setQuiz(newQuiz)
    }

    const updateCorrectAnswer = (questionIndex: number, correct: number) => {
        const newQuiz = [...quiz]
        newQuiz[questionIndex].correct = correct
        setQuiz(newQuiz)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        try {
            const user = getCurrentUserFromSession()
            if (!user) {
                setError("You must be logged in to create lessons")
                return
            }

            // Validation
            if (!formData.title.trim()) {
                setError("Lesson title is required")
                return
            }

            if (!formData.description.trim()) {
                setError("Lesson description is required")
                return
            }

            if (!formData.category) {
                setError("Please select a category")
                return
            }

            if (!formData.duration.trim()) {
                setError("Please specify the lesson duration")
                return
            }

            const points = Number.parseInt(formData.points)
            if (isNaN(points) || points < 1 || points > 100) {
                setError("Points must be a number between 1 and 100")
                return
            }

            if (!formData.introduction.trim()) {
                setError("Please provide an introduction for the lesson")
                return
            }

            // Validate sections
            const validSections = sections.filter(s => s.title.trim() && s.content.some(c => c.trim()))
            if (validSections.length === 0) {
                setError("Please add at least one section with content")
                return
            }

            // Validate quiz
            const validQuiz = quiz.filter(q =>
                q.question.trim() &&
                q.options.filter(o => o.trim()).length >= 2
            )
            if (validQuiz.length === 0) {
                setError("Please add at least one quiz question with at least 2 options")
                return
            }

            // Clean up sections (remove empty content items)
            const cleanedSections = validSections.map(s => ({
                title: s.title.trim(),
                content: s.content.filter(c => c.trim())
            }))

            // Clean up tips
            const cleanedTips = tips.filter(t => t.trim())

            // Clean up quiz (ensure all options are filled)
            const cleanedQuiz = validQuiz.map(q => ({
                question: q.question.trim(),
                options: q.options.map(o => o.trim() || "Option"),
                correct: q.correct
            }))

            // Icon mapping based on category
            const iconMap: { [key: string]: string } = {
                planting: "TreePine",
                waste: "Recycle",
                energy: "Zap",
                water: "Droplets"
            }

            // Create lesson object
            const lesson: Lesson = {
                id: isEditing && editId ? editId : Date.now().toString(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category as "planting" | "waste" | "energy" | "water",
                icon: iconMap[formData.category] || "BookOpen",
                coverImage: formData.coverImage.trim() || "/placeholder.svg",
                duration: formData.duration.trim(),
                points,
                content: {
                    introduction: formData.introduction.trim(),
                    sections: cleanedSections,
                    tips: cleanedTips,
                    quiz: cleanedQuiz
                },
                createdBy: user.id,
                collegeCode: user.collegeCode,
                schoolId: user.school,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            if (isEditing) {
                await updateLesson(lesson)
            } else {
                await saveLesson(lesson)
            }

            router.push("/teacher?tab=lessons")
        } catch (err) {
            console.error('Error saving lesson:', err)
            setError("Failed to save lesson. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.push("/teacher")} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{isEditing ? "Edit Lesson" : "Create New Lesson"}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Lesson Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        type="text"
                                        placeholder="e.g., Tree Planting Basics"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select onValueChange={handleCategoryChange} value={formData.category}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planting">🌲 Tree Planting</SelectItem>
                                            <SelectItem value="waste">♻️ Waste Management</SelectItem>
                                            <SelectItem value="energy">⚡ Energy Conservation</SelectItem>
                                            <SelectItem value="water">💧 Water Conservation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Short Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="A brief summary of what students will learn..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    rows={2}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="duration">Duration *</Label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        type="text"
                                        placeholder="e.g., 10 min read"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="points">Points Reward *</Label>
                                    <Input
                                        id="points"
                                        name="points"
                                        type="number"
                                        min="1"
                                        max="100"
                                        placeholder="e.g., 20"
                                        value={formData.points}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coverImage">Cover Image URL</Label>
                                    <Input
                                        id="coverImage"
                                        name="coverImage"
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.coverImage}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="introduction">Introduction *</Label>
                                <Textarea
                                    id="introduction"
                                    name="introduction"
                                    placeholder="Provide a detailed introduction to the lesson topic..."
                                    value={formData.introduction}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    rows={4}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sections Builder */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <GripVertical className="h-5 w-5" />
                                <span>Lesson Sections</span>
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addSection}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Section
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="border rounded-lg p-4 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="outline">Section {sectionIndex + 1}</Badge>
                                        {sections.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSection(sectionIndex)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Section Title *</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g., Environmental Impact of Trees"
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Content Points</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => addSectionContent(sectionIndex)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Point
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {section.content.map((content, contentIndex) => (
                                                    <div key={contentIndex} className="flex items-start space-x-2">
                                                        <span className="text-muted-foreground mt-2.5">•</span>
                                                        <Textarea
                                                            placeholder="Enter a content point..."
                                                            value={content}
                                                            onChange={(e) => updateSectionContent(sectionIndex, contentIndex, e.target.value)}
                                                            rows={2}
                                                            className="flex-1"
                                                        />
                                                        {section.content.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeSectionContent(sectionIndex, contentIndex)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tips Builder */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5" />
                                <span>Key Tips & Takeaways</span>
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addTip}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Tip
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {tips.map((tip, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                    <span className="text-yellow-500 mt-2.5">💡</span>
                                    <Textarea
                                        placeholder="Enter a helpful tip..."
                                        value={tip}
                                        onChange={(e) => updateTip(index, e.target.value)}
                                        rows={2}
                                        className="flex-1"
                                    />
                                    {tips.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTip(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quiz Builder */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <HelpCircle className="h-5 w-5" />
                                <span>Knowledge Quiz</span>
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {quiz.map((question, questionIndex) => (
                                <div key={questionIndex} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge>Question {questionIndex + 1}</Badge>
                                        {quiz.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeQuestion(questionIndex)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Question *</Label>
                                            <Input
                                                type="text"
                                                placeholder="Enter your question..."
                                                value={question.question}
                                                onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label>Answer Options (select the correct one)</Label>
                                            <div className="space-y-2 mt-2">
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${questionIndex}`}
                                                            checked={question.correct === optionIndex}
                                                            onChange={() => updateCorrectAnswer(questionIndex, optionIndex)}
                                                            className="h-4 w-4 text-primary"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder={`Option ${optionIndex + 1}`}
                                                            value={option}
                                                            onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                                            className={question.correct === optionIndex ? "border-green-500 ring-1 ring-green-500" : ""}
                                                        />
                                                        {question.correct === optionIndex && (
                                                            <Badge className="bg-green-500 shrink-0">Correct</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex space-x-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/teacher")} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Lesson" : "Create Lesson")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
