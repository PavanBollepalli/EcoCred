import { getDatabase } from './mongodb'

// Re-export getDatabase for API routes
export { getDatabase }
import type { User, Task, Submission, GlobalStats, LessonProgress, School, CalendarEvent, SeasonalEvent, Announcement, ImageUpload } from './types'

// User management
export async function getUsers(): Promise<User[]> {
  try {
    const db = await getDatabase()
    const users = await db.collection<User>('users').find({}).toArray()
    return users.map(user => ({ ...user, _id: undefined }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<User>('users').replaceOne(
      { id: user.id },
      user,
      { upsert: true }
    )
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ id: userId })
    return user ? { ...user, _id: undefined } : null
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ email })
    return user ? { ...user, _id: undefined } : null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

// Task management
export async function getTasks(): Promise<Task[]> {
  try {
    const db = await getDatabase()
    const tasks = await db.collection<Task>('tasks').find({}).toArray()
    return tasks.map(task => ({ ...task, _id: undefined }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export async function saveTask(task: Task): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<Task>('tasks').replaceOne(
      { id: task.id },
      task,
      { upsert: true }
    )
  } catch (error) {
    console.error('Error saving task:', error)
    throw error
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const db = await getDatabase()
    const task = await db.collection<Task>('tasks').findOne({ id: taskId })
    return task ? { ...task, _id: undefined } : null
  } catch (error) {
    console.error('Error fetching task by ID:', error)
    return null
  }
}

// Submission management
export async function getSubmissions(): Promise<Submission[]> {
  try {
    const db = await getDatabase()
    const submissions = await db.collection<Submission>('submissions').find({}).toArray()
    return submissions.map(submission => ({ ...submission, _id: undefined }))
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return []
  }
}

export async function saveSubmission(submission: Submission): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<Submission>('submissions').replaceOne(
      { id: submission.id },
      submission,
      { upsert: true }
    )
  } catch (error) {
    console.error('Error saving submission:', error)
    throw error
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  try {
    const db = await getDatabase()
    const result = await db.collection<Submission>('submissions').deleteOne({ id })
    if (result.deletedCount === 0) {
      throw new Error('Submission not found')
    }
  } catch (error) {
    console.error('Error deleting submission:', error)
    throw error
  }
}

export async function getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
  try {
    const db = await getDatabase()
    const submissions = await db.collection<Submission>('submissions')
      .find({ studentId }).toArray()
    return submissions.map(submission => ({ ...submission, _id: undefined }))
  } catch (error) {
    console.error('Error fetching submissions by student:', error)
    return []
  }
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  try {
    const db = await getDatabase()
    const submission = await db.collection<Submission>('submissions').findOne({ id })
    return submission ? { ...submission, _id: undefined } : null
  } catch (error) {
    console.error('Error fetching submission by ID:', error)
    return null
  }
}

export async function getSubmissionsByTask(taskId: string): Promise<Submission[]> {
  try {
    const db = await getDatabase()
    const submissions = await db.collection<Submission>('submissions')
      .find({ taskId }).toArray()
    return submissions.map(submission => ({ ...submission, _id: undefined }))
  } catch (error) {
    console.error('Error fetching submissions by task:', error)
    return []
  }
}

// Global stats
export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const db = await getDatabase()
    const stats = await db.collection<GlobalStats>('globalStats').findOne({})
    
    if (stats) {
      return { ...stats, _id: undefined }
    }
    
    // Return default stats if none exist
    return {
      totalSaplings: 0,
      totalWasteSaved: 0,
      totalStudents: 0,
      totalTasks: 0,
      lastUpdated: new Date().toISOString(),
    }
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

export async function updateGlobalStats(stats: Partial<GlobalStats>): Promise<void> {
  try {
    const db = await getDatabase()
    const updatedStats: GlobalStats = {
      totalSaplings: stats.totalSaplings || 0,
      totalWasteSaved: stats.totalWasteSaved || 0,
      totalStudents: stats.totalStudents || 0,
      totalTasks: stats.totalTasks || 0,
      lastUpdated: new Date().toISOString(),
    }
    await db.collection<GlobalStats>('globalStats').replaceOne(
      {},
      updatedStats,
      { upsert: true }
    )
  } catch (error) {
    console.error('Error updating global stats:', error)
    throw error
  }
}

// Lesson progress
export async function completeLesson(userId: string, lessonId: string, points: number): Promise<void> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ id: userId })
    
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.completedLessons) {
      user.completedLessons = []
    }
    if (!user.lessonProgress) {
      user.lessonProgress = {}
    }

    // Add to completed lessons if not already completed
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId)
      user.ecoPoints += points
    }

    // Update lesson progress
    user.lessonProgress[lessonId] = {
      lessonId,
      completed: true,
      progress: 100,
      completedAt: new Date().toISOString(),
      pointsEarned: points,
    }

    await db.collection<User>('users').replaceOne(
      { id: userId },
      user,
      { upsert: true }
    )
  } catch (error) {
    console.error('Error completing lesson:', error)
    throw error
  }
}

export async function getUserLessonProgress(userId: string, lessonId: string): Promise<LessonProgress> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ id: userId })

    if (user && user.lessonProgress && user.lessonProgress[lessonId]) {
      return user.lessonProgress[lessonId]
    }

    return {
      lessonId,
      completed: false,
      progress: 0,
      pointsEarned: 0,
    }
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

export async function getCompletedLessonsCount(userId: string): Promise<number> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ id: userId })
    return user && user.completedLessons ? user.completedLessons.length : 0
  } catch (error) {
    console.error('Error fetching completed lessons count:', error)
    return 0
  }
}

// Enhanced badge system with automatic badge assignment
export async function assignBadges(userId: string): Promise<string[]> {
  try {
    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({ id: userId })
    
    if (!user) return []

    const submissions = await db.collection<Submission>('submissions')
      .find({ studentId: userId, status: "approved" }).toArray()
    
    const tasks = await db.collection<Task>('tasks').find({}).toArray()
    
    // Calculate completed tasks by category
    const completedTasksByCategory = submissions.reduce((acc, submission) => {
      const task = tasks.find(t => t.id === submission.taskId)
      if (task) {
        acc[task.category] = (acc[task.category] || 0) + 1
      }
      return acc
    }, {} as { [key: string]: number })

    const newBadges: string[] = []
    const currentBadges = user.badges || []

    // First Step Badge
    if (submissions.length > 0 && !currentBadges.includes("First Step")) {
      newBadges.push("First Step")
    }

    // Eco Warrior Badge
    if (user.ecoPoints >= 100 && !currentBadges.includes("Eco Warrior")) {
      newBadges.push("Eco Warrior")
    }

    // Tree Planter Badge
    if ((completedTasksByCategory.planting || 0) >= 3 && !currentBadges.includes("Tree Planter")) {
      newBadges.push("Tree Planter")
    }

    // Waste Warrior Badge
    if ((completedTasksByCategory.waste || 0) >= 3 && !currentBadges.includes("Waste Warrior")) {
      newBadges.push("Waste Warrior")
    }

    // Energy Saver Badge
    if ((completedTasksByCategory.energy || 0) >= 3 && !currentBadges.includes("Energy Saver")) {
      newBadges.push("Energy Saver")
    }

    // Water Guardian Badge
    if ((completedTasksByCategory.water || 0) >= 3 && !currentBadges.includes("Water Guardian")) {
      newBadges.push("Water Guardian")
    }

    // Streak Master Badge
    if (user.streak >= 7 && !currentBadges.includes("Streak Master")) {
      newBadges.push("Streak Master")
    }

    // Environmental Champion Badge
    if (user.ecoPoints >= 500 && !currentBadges.includes("Environmental Champion")) {
      newBadges.push("Environmental Champion")
    }

    // Green Champion Badge (for lesson completion)
    if (user.completedLessons && user.completedLessons.length >= 2 && !currentBadges.includes("Green Champion")) {
      newBadges.push("Green Champion")
    }

    // Update user with new badges
    if (newBadges.length > 0) {
      const updatedBadges = [...currentBadges, ...newBadges]
      await db.collection<User>('users').updateOne(
        { id: userId },
        { $set: { badges: updatedBadges } }
      )
    }

    return newBadges
  } catch (error) {
    console.error('Error assigning badges:', error)
    return []
  }
}

// Initialize demo data
export async function initializeDemoData(): Promise<void> {
  try {
    const db = await getDatabase()
    
    // Initialize global stats if not exists
    const existingStats = await db.collection<GlobalStats>('globalStats').findOne({})
    if (!existingStats) {
      await db.collection<GlobalStats>('globalStats').insertOne({
        totalSaplings: 0,
        totalWasteSaved: 0,
        totalStudents: 0,
        totalTasks: 0,
        lastUpdated: new Date().toISOString(),
      })
    }

  
    
  } catch (error) {
    console.error('Error initializing demo data:', error)
    throw error
  }
}

// School management
export async function getSchools(): Promise<School[]> {
  try {
    const db = await getDatabase()
    return await db.collection<School>('schools').find({}).toArray()
  } catch (error) {
    console.error('Error fetching schools:', error)
    return []
  }
}

export async function createSchool(schoolData: Omit<School, 'id'>): Promise<School> {
  try {
    const db = await getDatabase()
    const school: School = {
      id: Date.now().toString(),
      ...schoolData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await db.collection<School>('schools').insertOne(school)
    return school
  } catch (error) {
    console.error('Error creating school:', error)
    throw error
  }
}

export async function updateSchool(id: string, schoolData: Partial<School>): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<School>('schools').updateOne(
      { id },
      { 
        $set: { 
          ...schoolData, 
          updatedAt: new Date().toISOString() 
        } 
      }
    )
  } catch (error) {
    console.error('Error updating school:', error)
    throw error
  }
}

export async function deleteSchool(id: string): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<School>('schools').deleteOne({ id })
  } catch (error) {
    console.error('Error deleting school:', error)
    throw error
  }
}

// Calendar management
export async function getCalendarEvents(schoolId?: string): Promise<CalendarEvent[]> {
  try {
    const db = await getDatabase()
    const filter = schoolId ? { schoolId } : {}
    return await db.collection<CalendarEvent>('calendarEvents').find(filter).toArray()
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export async function createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  try {
    const db = await getDatabase()
    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString()
    }
    await db.collection<CalendarEvent>('calendarEvents').insertOne(event)
    return event
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

// Seasonal events management
export async function getSeasonalEvents(): Promise<SeasonalEvent[]> {
  try {
    const db = await getDatabase()
    return await db.collection<SeasonalEvent>('seasonalEvents').find({}).toArray()
  } catch (error) {
    console.error('Error fetching seasonal events:', error)
    return []
  }
}

export async function createSeasonalEvent(eventData: Omit<SeasonalEvent, 'id'>): Promise<SeasonalEvent> {
  try {
    const db = await getDatabase()
    const event: SeasonalEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString()
    }
    await db.collection<SeasonalEvent>('seasonalEvents').insertOne(event)
    return event
  } catch (error) {
    console.error('Error creating seasonal event:', error)
    throw error
  }
}

export async function updateSeasonalEvent(id: string, eventData: Partial<SeasonalEvent>): Promise<SeasonalEvent> {
  try {
    const db = await getDatabase()
    const updateData = {
      ...eventData,
      updatedAt: new Date().toISOString()
    }
    const result = await db.collection<SeasonalEvent>('seasonalEvents').findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new Error('Seasonal event not found')
    }
    return result
  } catch (error) {
    console.error('Error updating seasonal event:', error)
    throw error
  }
}

export async function deleteSeasonalEvent(id: string): Promise<void> {
  try {
    const db = await getDatabase()
    const result = await db.collection<SeasonalEvent>('seasonalEvents').deleteOne({ id })
    if (result.deletedCount === 0) {
      throw new Error('Seasonal event not found')
    }
  } catch (error) {
    console.error('Error deleting seasonal event:', error)
    throw error
  }
}

// Announcements management
export async function getAnnouncements(schoolId?: string, targetAudience?: string): Promise<Announcement[]> {
  try {
    const db = await getDatabase()
    const filter: any = { isActive: true }
    if (schoolId) filter.schoolId = schoolId
    if (targetAudience) filter.targetAudience = targetAudience
    return await db.collection<Announcement>('announcements').find(filter).sort({ createdAt: -1 }).toArray()
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

export async function createAnnouncement(announcementData: Omit<Announcement, 'id'>): Promise<Announcement> {
  try {
    const db = await getDatabase()
    const announcement: Announcement = {
      id: Date.now().toString(),
      ...announcementData,
      createdAt: new Date().toISOString()
    }
    await db.collection<Announcement>('announcements').insertOne(announcement)
    return announcement
  } catch (error) {
    console.error('Error creating announcement:', error)
    throw error
  }
}

// Image management
export async function saveImageUpload(imageData: Omit<ImageUpload, 'id'>): Promise<ImageUpload> {
  try {
    const db = await getDatabase()
    const image: ImageUpload = {
      id: Date.now().toString(),
      ...imageData,
      uploadedAt: new Date().toISOString()
    }
    await db.collection<ImageUpload>('imageUploads').insertOne(image)
    return image
  } catch (error) {
    console.error('Error saving image upload:', error)
    throw error
  }
}

export async function getImageUploads(filters?: {
  uploadedBy?: string
  taskId?: string
  submissionId?: string
  isPublic?: boolean
}): Promise<ImageUpload[]> {
  try {
    const db = await getDatabase()
    const query: any = {}
    
    if (filters?.uploadedBy) query.uploadedBy = filters.uploadedBy
    if (filters?.taskId) query.taskId = filters.taskId
    if (filters?.submissionId) query.submissionId = filters.submissionId
    if (filters?.isPublic !== undefined) query.isPublic = filters.isPublic
    
    return await db.collection<ImageUpload>('imageUploads').find(query).sort({ uploadedAt: -1 }).toArray()
  } catch (error) {
    console.error('Error fetching image uploads:', error)
    return []
  }
}

export async function getImageUploadById(id: string): Promise<ImageUpload | null> {
  try {
    const db = await getDatabase()
    return await db.collection<ImageUpload>('imageUploads').findOne({ id })
  } catch (error) {
    console.error('Error fetching image upload by ID:', error)
    return null
  }
}

export async function deleteImageUpload(id: string): Promise<void> {
  try {
    const db = await getDatabase()
    await db.collection<ImageUpload>('imageUploads').deleteOne({ id })
  } catch (error) {
    console.error('Error deleting image upload:', error)
    throw error
  }
}

// School rankings based on student eco points
export async function getSchoolRankings(limit: number = 5): Promise<Array<{school: School, totalPoints: number, studentCount: number}>> {
  try {
    const db = await getDatabase()
    const users = await db.collection<User>('users').find({ role: 'student' }).toArray()
    const schools = await db.collection<School>('schools').find({}).toArray()
    
    const schoolRankings = schools.map(school => {
      const schoolStudents = users.filter(user => user.school === school.name)
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
