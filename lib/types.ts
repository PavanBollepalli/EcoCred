import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  id: string
  email: string
  name: string
  role: "student" | "teacher" | "admin"
  school: string
  ecoPoints: number
  badges: string[]
  streak: number
  joinedAt: string
  completedLessons: string[]
  lessonProgress: { [lessonId: string]: LessonProgress }
  profilePicture?: string
  avatar?: string
  bio?: string
  level?: number
  createdAt?: string
  lastActive?: string
  lastLogin?: string // ISO timestamp of last login
  lastDailyReward?: string // YYYY-MM-DD format for daily reward tracking
}

export interface Task {
  _id?: ObjectId
  id: string
  title: string
  description: string
  category: "planting" | "waste" | "energy" | "water"
  points: number
  createdBy: string
  createdAt: string
}

export interface Submission {
  _id?: ObjectId
  id: string
  taskId: string
  studentId: string
  evidence: string
  location?: string
  description?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  comments?: string
  mlConfidence?: number | null
  aiDetectedObjects?: string[]
  aiReasoning?: string
}

export interface GlobalStats {
  _id?: ObjectId
  totalSaplings: number
  totalWasteSaved: number
  totalStudents: number
  totalTasks: number
  lastUpdated: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  progress: number
  completedAt?: string
  pointsEarned: number
}

export interface School {
  _id?: ObjectId
  id: string
  name: string
  location: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  _id?: ObjectId
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  type: "deadline" | "event" | "holiday" | "seasonal"
  isAllDay: boolean
  schoolId?: string
  createdBy: string
  createdAt: string
}

export interface SeasonalEvent {
  _id?: ObjectId
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  rewards: {
    points: number
    badges: string[]
    specialItems: string[]
  }
  isActive: boolean
  createdAt: string
}

export interface Announcement {
  _id?: ObjectId
  id: string
  title: string
  message: string
  authorId: string
  authorName: string
  schoolId?: string
  targetAudience: "all" | "students" | "teachers" | "specific_school"
  priority: "low" | "medium" | "high"
  isActive: boolean
  createdAt: string
  expiresAt?: string
}

export interface ImageUpload {
  _id?: ObjectId
  id: string
  url: string
  fileName: string
  fileSize: number
  contentType: string
  uploadedBy: string
  uploadedAt: string
  taskId?: string
  submissionId?: string
  isPublic: boolean
  metadata?: {
    width?: number
    height?: number
    description?: string
  }
}

// Lesson types for teacher-created lessons
export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

export interface LessonSection {
  title: string
  content: string[]
}

export interface Lesson {
  _id?: ObjectId
  id: string
  title: string
  description: string
  category: "planting" | "waste" | "energy" | "water"
  icon: string  // Icon name as string for serialization (e.g., "TreePine", "Recycle")
  coverImage: string
  duration: string
  points: number
  content: {
    introduction: string
    sections: LessonSection[]
    tips: string[]
    quiz: QuizQuestion[]
  }
  createdBy: string
  schoolId?: string  // Optional: lessons can be school-specific
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Badge requirement types
export type BadgeRequirementType = "points" | "tasks" | "lessons" | "streak" | "category_tasks"

export interface BadgeRequirement {
  type: BadgeRequirementType
  value: number
  category?: "planting" | "waste" | "energy" | "water"
}

// Dynamic Badge created by teachers
export interface Badge {
  _id?: ObjectId
  id: string
  name: string
  description: string
  icon: string // Icon name from lucide-react (e.g., "Trophy", "Star", "Award")
  color: string // Tailwind color class (e.g., "bg-green-500")
  requirement: BadgeRequirement
  createdBy: string
  schoolId?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// For tracking newly earned badges
export interface EarnedBadge {
  badgeId: string
  badge: Badge
  earnedAt: string
}

// Points Ledger for tracking all point transactions
export interface PointsLedgerEntry {
  _id?: ObjectId
  id: string
  userId: string
  points: number
  source: 'daily_login' | 'game' | 'assessment' | 'task' | 'lesson'
  sourceId?: string // ID of the task, game, assessment, or lesson
  timestamp: string
  metadata?: Record<string, any>
}

// AI Assessment System
export interface AssessmentQuestion {
  id: string
  question: string
  type: 'mcq' | 'short_answer'
  options?: string[] // For MCQ questions
  correctAnswer: string | number // Index for MCQ, text for short answer
  explanation: string
  points: number
}

export interface Assessment {
  _id?: ObjectId
  id: string
  title: string
  topic: string
  description: string
  category: "planting" | "waste" | "energy" | "water"
  questions: AssessmentQuestion[]
  totalPoints: number
  badgeName: string // Badge awarded on completion
  createdBy: string
  schoolId?: string
  status: 'active' | 'draft' | 'archived'
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number // in minutes
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssessmentAttempt {
  _id?: ObjectId
  id: string
  userId: string
  assessmentId: string
  answers: Record<string, string> // questionId -> answer
  score: number
  maxScore: number
  completedAt: string
  pointsEarned: number
  badgeAwarded?: boolean
}

// Educational Games System
export interface Game {
  id: string
  name: string
  description: string
  category: 'energy' | 'waste' | 'water' | 'pollution'
  points: number
  badgeName: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
}

export interface GameCompletion {
  _id?: ObjectId
  id: string
  userId: string
  gameId: string
  score: number
  completedAt: string
  pointsEarned: number
}

// Event Logging
export interface EventLog {
  _id?: ObjectId
  id: string
  userId: string
  eventType: 'daily_login' | 'game_completed' | 'assessment_completed' | 'task_approved' | 'lesson_completed'
  eventData: Record<string, any>
  timestamp: string
}
