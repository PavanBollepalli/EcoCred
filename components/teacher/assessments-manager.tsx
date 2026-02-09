"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Trash2,
    ClipboardList,
    Users,
    Award,
    Clock,
    AlertTriangle,
    Loader2,
    ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUserFromSession } from '@/lib/storage-api'
import type { Assessment, User } from '@/lib/types'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getUsers } from '@/lib/storage-api'

interface AssessmentsManagerProps {
    isEmbedded?: boolean
}

export function AssessmentsManager({ isEmbedded = false }: AssessmentsManagerProps) {
    const router = useRouter()
    const [assessments, setAssessments] = useState<Assessment[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [viewResultsOpen, setViewResultsOpen] = useState(false)
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
    const [studentAttempts, setStudentAttempts] = useState<any[]>([])
    const [loadingResults, setLoadingResults] = useState(false)
    const [usersMap, setUsersMap] = useState<Record<string, User>>({})

    useEffect(() => {
        const user = getCurrentUserFromSession()
        if (user) {
            setCurrentUser(user)
            fetchAssessments(user.school)
        }
    }, [])

    const fetchAssessments = async (schoolId: string) => {
        try {
            const response = await fetch(`/api/assessments?schoolId=${schoolId}`)
            if (response.ok) {
                const data = await response.json()
                // Filter to show only assessments created by this teacher
                // In a real app we'd filter by ID, but for now name fallback helps if IDs changed
                const myAssessments = data.filter((a: Assessment) =>
                    a.createdBy === currentUser?.id || a.createdBy === currentUser?.name
                )
                setAssessments(data) // Show all for now as per original implementation
            }
        } catch (error) {
            console.error('Error fetching assessments:', error)
            toast.error('Failed to load assessments')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (assessmentId: string, assessmentTitle: string) => {
        setDeleting(assessmentId)
        try {
            const response = await fetch(`/api/assessments?id=${assessmentId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setAssessments(prev => prev.filter(a => a.id !== assessmentId))
                toast.success(`"${assessmentTitle}" deleted successfully`)
            } else {
                throw new Error('Failed to delete')
            }
        } catch (error) {
            console.error('Error deleting assessment:', error)
            toast.error('Failed to delete assessment')
        } finally {
            setDeleting(null)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'archived': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleViewResults = async (assessment: Assessment) => {
        setSelectedAssessment(assessment)
        setViewResultsOpen(true)
        setLoadingResults(true)
        try {
            // Fetch attempts
            const attemptsRes = await fetch(`/api/assessments/attempt?assessmentId=${assessment.id}`)
            const attempts = await attemptsRes.json()
            setStudentAttempts(attempts)

            // Fetch users map if empty
            if (Object.keys(usersMap).length === 0) {
                try {
                    const users = await getUsers()
                    const map: Record<string, User> = {}
                    users.forEach((u: User) => {
                        map[u.id] = u
                    })
                    setUsersMap(map)
                } catch (e) {
                    console.error("Error fetching users", e)
                }
            }
        } catch (error) {
            console.error('Error fetching results:', error)
            toast.error('Failed to load results')
        } finally {
            setLoadingResults(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading assessments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header - Only show if not embedded or if we want a title inside tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {!isEmbedded && (
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/teacher')}
                            className="p-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
                        <p className="text-muted-foreground">Manage your assessments</p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push('/teacher/create-assessment')}
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-100">
                    <CardContent className="p-4 text-center">
                        <ClipboardList className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
                        <div className="text-xs text-muted-foreground">Total Assessments</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-100">
                    <CardContent className="p-4 text-center">
                        <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">
                            {assessments.filter(a => a.status === 'active').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Active</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-yellow-100">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">
                            {assessments.filter(a => a.status === 'draft').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Drafts</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-purple-100">
                    <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">
                            {assessments.reduce((sum, a) => sum + (a.questions?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Questions</div>
                    </CardContent>
                </Card>
            </div>

            {/* Assessments List */}
            {assessments.length === 0 ? (
                <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                        <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Assessments Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first assessment to test your students' knowledge
                        </p>
                        <Button
                            onClick={() => router.push('/teacher/create-assessment')}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Assessment
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {assessments.map((assessment) => (
                        <Card
                            key={assessment.id}
                            className="border-2 hover:border-primary/50 transition-all hover:shadow-md"
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">{assessment.title}</h3>
                                            <Badge className={getStatusColor(assessment.status)}>
                                                {assessment.status}
                                            </Badge>
                                            <Badge className={getDifficultyColor(assessment.difficulty)}>
                                                {assessment.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {assessment.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <ClipboardList className="h-4 w-4" />
                                                {assessment.questions?.length || 0} Questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Award className="h-4 w-4" />
                                                {assessment.totalPoints} Points
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {assessment.timeLimit} min
                                            </span>
                                            {assessment.badgeName && (
                                                <span className="flex items-center gap-1">
                                                    🏆 {assessment.badgeName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewResults(assessment)}
                                        >
                                            <ClipboardList className="h-4 w-4 mr-2" />
                                            Results
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deleting === assessment.id}
                                                >
                                                    {deleting === assessment.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                        Delete Assessment?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{assessment.title}"?
                                                        This action cannot be undone and will remove all
                                                        associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(assessment.id, assessment.title)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <Dialog open={viewResultsOpen} onOpenChange={setViewResultsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assessment Results: {selectedAssessment?.title}</DialogTitle>
                        <DialogDescription>
                            View student attempts and scores for this assessment.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingResults ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentAttempts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No attempts recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    studentAttempts.map((attempt) => {
                                        const student = usersMap[attempt.userId]
                                        return (
                                            <TableRow key={attempt.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {student?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div>{student?.name || 'Unknown User'}</div>
                                                            <div className="text-xs text-muted-foreground">{student?.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold">
                                                        {attempt.score} / {attempt.maxScore}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {Math.round((attempt.score / attempt.maxScore) * 100)}%
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={attempt.score >= (attempt.maxScore * 0.7) ? "default" : "destructive"}>
                                                        {attempt.score >= (attempt.maxScore * 0.7) ? "Passed" : "Failed"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
