"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TreePine, Recycle, Zap, Droplets, CheckCircle, BookOpen } from "lucide-react"
import { getCurrentUserFromSession, completeLesson, getUserLessonProgress, getLessonById, getCurrentUser, setCurrentUser } from "@/lib/storage-api"
import type { User, Lesson } from "@/lib/storage-api"

// Icon mapping for dynamic lessons
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "TreePine":
      return TreePine
    case "Recycle":
      return Recycle
    case "Zap":
      return Zap
    case "Droplets":
      return Droplets
    default:
      return BookOpen
  }
}

export default function LessonPage() {
  return (
    <AuthGuard requiredRole="student">
      <LessonContent />
    </AuthGuard>
  )
}

function LessonContent() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState(0)

  const lessonId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const currentUser = getCurrentUserFromSession()
        setUser(currentUser)

        // Fetch lesson from API
        const fetchedLesson = await getLessonById(lessonId)
        setLesson(fetchedLesson)

        if (currentUser && lessonId) {
          const lessonProgress = await getUserLessonProgress(currentUser.id, lessonId)
          setCompleted(lessonProgress.completed)
          setProgress(lessonProgress.progress)
        }
      } catch (error) {
        console.error('Error loading lesson data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [lessonId])

  useEffect(() => {
    if (lesson) {
      const totalSections = lesson.content.sections.length + 1 // +1 for quiz
      const newProgress = ((currentSection + (showQuiz ? 1 : 0)) / totalSections) * 100
      setProgress(newProgress)
    }
  }, [currentSection, showQuiz, lesson])

  const handleQuizSubmit = async () => {
    if (!lesson || !user) return

    const correctAnswers = quizAnswers.reduce((count, answer, index) => {
      if (answer === lesson.content.quiz[index].correct) {
        return count + 1
      }
      return count
    }, 0)

    const passingScore = Math.ceil(lesson.content.quiz.length * 0.7)

    if (correctAnswers >= passingScore) {
      try {
        await completeLesson(user.id, lesson.id, lesson.points)

        // Refresh user data from database and update session
        const updatedUser = await getCurrentUser(user.id)
        if (updatedUser) {
          setCurrentUser(updatedUser)
          setUser(updatedUser)
        }

        setCompleted(true)
        setProgress(100)
        alert(
          `🎉 Congratulations! You passed with ${correctAnswers}/${lesson.content.quiz.length} correct answers! You earned ${lesson.points} points!`
        )
        router.push("/student")
      } catch (error) {
        console.error("Error completing lesson:", error)
        alert("Failed to save your progress. Please try again.")
      }
    } else {
      alert(
        `You got ${correctAnswers}/${lesson.content.quiz.length} correct. You need at least ${passingScore} to pass. Try reviewing the lesson again!`
      )
      setShowQuiz(false)
      setCurrentSection(0)
      setQuizAnswers([])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <p className="text-muted-foreground mb-6">
            This lesson may have been removed or doesn't exist.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const IconComponent = getIconComponent(lesson.icon)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lessons
        </Button>

        {/* Lesson Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img
              src={lesson.coverImage || "/placeholder.svg"}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className="h-6 w-6" />
                  <Badge variant="secondary" className="capitalize">
                    {lesson.category}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white">
                    {lesson.duration}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
                <p className="text-white/80 mt-2">{lesson.description}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {completed && (
              <div className="flex items-center text-green-600 mt-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Lesson completed! +{lesson.points} points earned
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Content */}
        <Card>
          <CardContent className="p-6 md:p-8">
            {!showQuiz ? (
              <>
                {/* Introduction */}
                {currentSection === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Introduction</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{lesson.content.introduction}</p>
                    <div className="bg-accent/50 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Key Takeaways</h3>
                      <ul className="space-y-3">
                        {lesson.content.tips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Lesson Sections */}
                {currentSection > 0 && currentSection <= lesson.content.sections.length && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">{lesson.content.sections[currentSection - 1].title}</h2>
                    <ul className="space-y-4">
                      {lesson.content.sections[currentSection - 1].content.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-primary text-xl">•</span>
                          <span className="text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: lesson.content.sections.length + 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSection(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${currentSection === index ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                      disabled={currentSection === 0}
                    >
                      Previous
                    </Button>

                    {currentSection < lesson.content.sections.length ? (
                      <Button onClick={() => setCurrentSection(currentSection + 1)}>Next</Button>
                    ) : (
                      <Button onClick={() => setShowQuiz(true)}>Take Quiz</Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Knowledge Check</h2>
                <p className="text-muted-foreground mb-6">
                  Answer at least {Math.ceil(lesson.content.quiz.length * 0.7)} questions correctly to complete the
                  lesson.
                </p>

                {lesson.content.quiz.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-4 p-6 border rounded-lg">
                    <h3 className="font-semibold">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={oIndex}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => {
                              const newAnswers = [...quizAnswers]
                              newAnswers[qIndex] = oIndex
                              setQuizAnswers(newAnswers)
                            }}
                            className="text-primary"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setShowQuiz(false)}>
                    Review Lesson
                  </Button>
                  <Button onClick={handleQuizSubmit} disabled={quizAnswers.length < lesson.content.quiz.length}>
                    Submit Quiz
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
