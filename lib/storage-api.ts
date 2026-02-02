// API-based storage utilities for EcoCred platform
// This replaces localStorage with MongoDB via API calls

export interface User {
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
  bio?: string
  level?: number
  createdAt?: string
  lastActive?: string
}

export interface School {
  id: string
  name: string
  location: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: "planting" | "waste" | "energy" | "water"
  points: number
  createdBy: string
  createdAt: string
}

export interface Submission {
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

// API helper functions
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

// User management
export const getUsers = async (): Promise<User[]> => {
  try {
    return await apiCall('/api/users')
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const saveUser = async (user: User): Promise<void> => {
  try {
    await apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

export const getCurrentUser = async (userId: string): Promise<User | null> => {
  try {
    return await apiCall(`/api/users/user?userId=${userId}`)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await apiCall(`/api/users/user?email=${email}`)
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

// Task management
export const getTasks = async (): Promise<Task[]> => {
  try {
    return await apiCall('/api/tasks')
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export const saveTask = async (task: Task): Promise<void> => {
  try {
    await apiCall('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  } catch (error) {
    console.error('Error saving task:', error)
    throw error
  }
}

export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    return await apiCall(`/api/tasks?taskId=${taskId}`)
  } catch (error) {
    console.error('Error fetching task by ID:', error)
    return null
  }
}

// Submission management
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    return await apiCall('/api/submissions')
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return []
  }
}

export const deleteSubmission = async (id: string): Promise<any> => {
  try {
    const response = await apiCall(`/api/submissions/${id}`, {
      method: 'DELETE',
    })
    return response
  } catch (error) {
    console.error('Error deleting submission:', error)
    throw error
  }
}

export const saveSubmission = async (submission: Submission): Promise<void> => {
  try {
    await apiCall('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    })
  } catch (error) {
    console.error('Error saving submission:', error)
    throw error
  }
}

export const getSubmissionsByStudent = async (studentId: string): Promise<Submission[]> => {
  try {
    return await apiCall(`/api/submissions?studentId=${studentId}`)
  } catch (error) {
    console.error('Error fetching submissions by student:', error)
    return []
  }
}

export const getSubmissionsByTask = async (taskId: string): Promise<Submission[]> => {
  try {
    return await apiCall(`/api/submissions?taskId=${taskId}`)
  } catch (error) {
    console.error('Error fetching submissions by task:', error)
    return []
  }
}

// Global stats
export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    return await apiCall('/api/stats')
  } catch (error) {
    console.error('Error fetching global stats:', error)
    return {
      totalSaplings: 0,
      totalWasteSaved: 0,
      totalStudents: 0,
      totalTasks: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

export const updateGlobalStats = async (stats: Partial<GlobalStats>): Promise<void> => {
  try {
    await apiCall('/api/stats', {
      method: 'POST',
      body: JSON.stringify(stats),
    })
  } catch (error) {
    console.error('Error updating global stats:', error)
    throw error
  }
}

// Lesson progress
export const completeLesson = async (userId: string, lessonId: string, points: number): Promise<void> => {
  try {
    await apiCall('/api/lessons', {
      method: 'POST',
      body: JSON.stringify({ userId, lessonId, points }),
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    throw error
  }
}

export const getUserLessonProgress = async (userId: string, lessonId: string): Promise<LessonProgress> => {
  try {
    return await apiCall(`/api/lessons?userId=${userId}&lessonId=${lessonId}&action=progress`)
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return {
      lessonId,
      completed: false,
      progress: 0,
      pointsEarned: 0,
    }
  }
}

export const getCompletedLessonsCount = async (userId: string): Promise<number> => {
  try {
    const result = await apiCall(`/api/lessons?userId=${userId}&action=count`)
    return result.count || 0
  } catch (error) {
    console.error('Error fetching completed lessons count:', error)
    return 0
  }
}

// Initialize demo data
export const initializeDemoData = async (): Promise<void> => {
  try {
    await apiCall('/api/init', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Error initializing demo data:', error)
    throw error
  }
}

// Wipe all data from MongoDB
export const wipeAllData = async (): Promise<void> => {
  try {
    await apiCall('/api/wipe-data', {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error wiping data:', error)
    throw error
  }
}

// Session management - using server-side sessions instead of localStorage
export const setCurrentUser = (user: User | null): void => {
  // This will be handled by server-side session management
  // For now, we'll use a simple approach but this should be replaced with proper session handling
  if (typeof window === "undefined") return
  if (user) {
    // Store in sessionStorage instead of localStorage for better security
    sessionStorage.setItem("ecocred_current_user", JSON.stringify(user))
  } else {
    sessionStorage.removeItem("ecocred_current_user")
  }
}

export const getCurrentUserFromSession = (): User | null => {
  if (typeof window === "undefined") return null
  const user = sessionStorage.getItem("ecocred_current_user")
  return user ? JSON.parse(user) : null
}

// School management
export const getSchools = async (): Promise<any[]> => {
  try {
    return await apiCall('/api/schools')
  } catch (error) {
    console.error('Error fetching schools:', error)
    return []
  }
}

export const createSchool = async (schoolData: any): Promise<void> => {
  try {
    await apiCall('/api/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData),
    })
  } catch (error) {
    console.error('Error creating school:', error)
    throw error
  }
}

export const updateSchool = async (id: string, schoolData: any): Promise<void> => {
  try {
    await apiCall(`/api/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schoolData),
    })
  } catch (error) {
    console.error('Error updating school:', error)
    throw error
  }
}

export const deleteSchool = async (id: string): Promise<void> => {
  try {
    await apiCall(`/api/schools/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error deleting school:', error)
    throw error
  }
}

// Calendar management
export const getCalendarEvents = async (schoolId?: string): Promise<any[]> => {
  try {
    const url = schoolId ? `/api/calendar?schoolId=${schoolId}` : '/api/calendar'
    return await apiCall(url)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export const createCalendarEvent = async (eventData: any): Promise<void> => {
  try {
    await apiCall('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

// Seasonal events management
export const getSeasonalEvents = async (): Promise<any[]> => {
  try {
    return await apiCall('/api/seasonal-events')
  } catch (error) {
    console.error('Error fetching seasonal events:', error)
    return []
  }
}

export const createSeasonalEvent = async (eventData: any): Promise<void> => {
  try {
    await apiCall('/api/seasonal-events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  } catch (error) {
    console.error('Error creating seasonal event:', error)
    throw error
  }
}

export const updateSeasonalEvent = async (id: string, eventData: any): Promise<void> => {
  try {
    await apiCall(`/api/seasonal-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  } catch (error) {
    console.error('Error updating seasonal event:', error)
    throw error
  }
}

export const deleteSeasonalEvent = async (id: string): Promise<void> => {
  try {
    await apiCall(`/api/seasonal-events/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error deleting seasonal event:', error)
    throw error
  }
}

// Announcements management
export const getAnnouncements = async (schoolId?: string, targetAudience?: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams()
    if (schoolId) params.append('schoolId', schoolId)
    if (targetAudience) params.append('targetAudience', targetAudience)
    const url = `/api/announcements${params.toString() ? '?' + params.toString() : ''}`
    return await apiCall(url)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

export const createAnnouncement = async (announcementData: any): Promise<void> => {
  try {
    await apiCall('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    throw error
  }
}

// Image management
export const getImages = async (filters?: {
  uploadedBy?: string
  taskId?: string
  submissionId?: string
  isPublic?: boolean
}): Promise<any[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.uploadedBy) params.append('uploadedBy', filters.uploadedBy)
    if (filters?.taskId) params.append('taskId', filters.taskId)
    if (filters?.submissionId) params.append('submissionId', filters.submissionId)
    if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString())
    
    const url = `/api/images${params.toString() ? '?' + params.toString() : ''}`
    return await apiCall(url)
  } catch (error) {
    console.error('Error fetching images:', error)
    return []
  }
}

// School rankings based on student eco points
export const getSchoolRankings = async (limit: number = 5): Promise<Array<{school: School, totalPoints: number, studentCount: number}>> => {
  try {
    const users = await getUsers()
    const schools = await getSchools()
    
    const schoolRankings = schools.map(school => {
      const schoolStudents = users.filter(user => user.school === school.name && user.role === 'student')
      const totalPoints = schoolStudents.reduce((sum, student) => sum + student.ecoPoints, 0)
      const studentCount = schoolStudents.length
      
      return {
        school,
        totalPoints,
        studentCount
      }
    }).filter(ranking => ranking.studentCount > 0)
     .sort((a, b) => b.totalPoints - a.totalPoints)
     .slice(0, limit)
    
    return schoolRankings
  } catch (error) {
    console.error('Error fetching school rankings:', error)
    return []
  }
}
