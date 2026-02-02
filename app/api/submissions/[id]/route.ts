import { NextRequest, NextResponse } from 'next/server'
import { 
  deleteSubmission, 
  deleteImageUpload, 
  getSubmissionById, 
  getCurrentUser, 
  getTaskById,
  saveUser,
  getGlobalStats,
  updateGlobalStats
} from '@/lib/database'
import { deleteImage } from '@/lib/minio'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id
    console.log('Starting deletion process for submission:', submissionId)

    // Get the submission to find the associated image and details
    const submission = await getSubmissionById(submissionId)
    if (!submission) {
      console.log('Submission not found:', submissionId)
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    console.log('Found submission:', submission.id, 'Status:', submission.status)

    // Only allow deletion of approved submissions (safety check)
    if (submission.status !== 'approved') {
      console.log('Submission not approved, cannot delete:', submission.status)
      return NextResponse.json({ error: 'Only approved submissions can be deleted' }, { status: 400 })
    }

    // Get the task to know how many points to deduct
    const task = await getTaskById(submission.taskId)
    if (!task) {
      console.log('Task not found:', submission.taskId)
      return NextResponse.json({ error: 'Associated task not found' }, { status: 404 })
    }

    console.log('Found task:', task.title, 'Points:', task.points)

    // Get the student to deduct points and update stats
    const student = await getCurrentUser(submission.studentId)
    if (!student) {
      console.log('Student not found:', submission.studentId)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    console.log('Found student:', student.name, 'Current points:', student.ecoPoints)

    // Delete the image from MinIO if it exists
    if (submission.evidence && submission.evidence.startsWith('http')) {
      try {
        await deleteImage(submission.evidence)
        console.log('Successfully deleted image from MinIO:', submission.evidence)
      } catch (error) {
        console.error('Error deleting image from MinIO:', error)
        // Continue with submission deletion even if image deletion fails
      }
    }

    // Delete the image upload record if it exists
    try {
      await deleteImageUpload(submissionId)
      console.log('Successfully deleted image upload record')
    } catch (error) {
      console.error('Error deleting image upload record:', error)
      // Continue with submission deletion even if image upload record deletion fails
    }

    // Reverse the points and stats that were awarded when approved
    const originalPoints = student.ecoPoints
    if (student.ecoPoints >= task.points) {
      student.ecoPoints -= task.points
    } else {
      student.ecoPoints = 0 // Prevent negative points
    }

    // Decrement streak (but don't go below 0)
    if (student.streak > 0) {
      student.streak -= 1
    }

    // Remove badges that might have been awarded due to this submission
    const updatedBadges = student.badges.filter(badge => {
      // Remove Eco Warrior badge if points fall below 100
      if (badge === "Eco Warrior" && student.ecoPoints < 100) {
        return false
      }
      // Remove First Step badge if this was their first submission
      if (badge === "First Step" && student.ecoPoints === 0) {
        return false
      }
      return true
    })
    student.badges = updatedBadges

    console.log('Updated student points from', originalPoints, 'to', student.ecoPoints)

    // Save the updated student
    await saveUser(student)
    console.log('Successfully updated student stats after deletion')

    // Update global stats (reverse the impact)
    const stats = await getGlobalStats()
    if (task.category === "planting" && stats.totalSaplings > 0) {
      await updateGlobalStats({ totalSaplings: stats.totalSaplings - 1 })
      console.log('Updated global saplings count')
    } else if (task.category === "waste" && stats.totalWasteSaved >= 5) {
      await updateGlobalStats({ totalWasteSaved: stats.totalWasteSaved - 5 })
      console.log('Updated global waste saved count')
    }

    // Finally, delete the submission record
    await deleteSubmission(submissionId)
    console.log('Successfully deleted submission record')

    return NextResponse.json({ 
      message: 'Submission and all associated data deleted successfully',
      pointsDeducted: task.points,
      studentUpdated: true,
      globalStatsUpdated: true
    })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json({ 
      error: 'Failed to delete submission',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}