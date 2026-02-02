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
  mlConfidence?: number
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
