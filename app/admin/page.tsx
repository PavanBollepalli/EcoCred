"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Users, 
  GraduationCap, 
  User as UserIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  BarChart3,
  Settings,
  Calendar,
  Megaphone,
  Award,
  TrendingUp,
  LogOut,
  Trophy,
  Gamepad2,
  BookOpen,
  Flame,
  Star,
  Activity,
  PieChart,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target
} from "lucide-react"
import { getUsers, getSchools, createSchool, updateSchool, deleteSchool, wipeAllData, deleteUser, getTasks, getSubmissions, getLessons } from "@/lib/storage-api"
import type { User, School, Task, Submission, Lesson } from "@/lib/storage-api"
import { SchoolDataList } from "@/components/school-data-list"

export default function AdminPortal() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  )
}

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, schoolsData, tasksData, submissionsData, lessonsData] = await Promise.all([
        getUsers(),
        getSchools(),
        getTasks(),
        getSubmissions(),
        getLessons()
      ])
      setUsers(usersData)
      setSchools(schoolsData)
      setTasks(tasksData)
      setSubmissions(submissionsData)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchool = async (schoolData: Omit<School, 'id'>) => {
    try {
      await createSchool(schoolData)
      await loadData()
      setShowSchoolForm(false)
    } catch (error) {
      console.error('Error creating school:', error)
    }
  }

  const handleUpdateSchool = async (id: string, schoolData: Partial<School>) => {
    try {
      await updateSchool(id, schoolData)
      await loadData()
      setEditingSchool(null)
    } catch (error) {
      console.error('Error updating school:', error)
    }
  }

  const handleDeleteSchool = async (id: string) => {
    if (confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      try {
        await deleteSchool(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting school:', error)
      }
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This will also remove all their submissions, points, and game completions. This action cannot be undone.`)) {
      setDeletingUser(userId)
      try {
        await deleteUser(userId)
        await loadData()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user. Admin users cannot be deleted.')
      } finally {
        setDeletingUser(null)
      }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.school?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = {
    totalUsers: users.length,
    totalSchools: schools.length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalAdmins: users.filter(u => u.role === 'admin').length
  }

  // Analytics computed data
  const analytics = useMemo(() => {
    const students = users.filter(u => u.role === 'student')
    const teachers = users.filter(u => u.role === 'teacher')

    // Points distribution
    const totalPoints = students.reduce((sum, s) => sum + s.ecoPoints, 0)
    const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0
    const maxPoints = students.length > 0 ? Math.max(...students.map(s => s.ecoPoints)) : 0

    // Top performers
    const topStudents = [...students].sort((a, b) => b.ecoPoints - a.ecoPoints).slice(0, 10)

    // Points range distribution
    const pointsRanges = [
      { label: '0-25', count: students.filter(s => s.ecoPoints >= 0 && s.ecoPoints <= 25).length },
      { label: '26-50', count: students.filter(s => s.ecoPoints > 25 && s.ecoPoints <= 50).length },
      { label: '51-100', count: students.filter(s => s.ecoPoints > 50 && s.ecoPoints <= 100).length },
      { label: '101-250', count: students.filter(s => s.ecoPoints > 100 && s.ecoPoints <= 250).length },
      { label: '251-500', count: students.filter(s => s.ecoPoints > 250 && s.ecoPoints <= 500).length },
      { label: '500+', count: students.filter(s => s.ecoPoints > 500).length },
    ]
    const maxRangeCount = Math.max(...pointsRanges.map(r => r.count), 1)

    // Streak distribution
    const avgStreak = students.length > 0 ? Math.round(students.reduce((s, u) => s + u.streak, 0) / students.length) : 0
    const maxStreak = students.length > 0 ? Math.max(...students.map(s => s.streak)) : 0
    const activeStreaks = students.filter(s => s.streak > 0).length

    // Submissions analysis
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length
    const totalSubmissions = submissions.length
    const approvalRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0

    // Tasks analysis
    const tasksByCategory = tasks.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // School performance
    const schoolPerformance = schools.map(school => {
      const schoolStudents = students.filter(s => s.school === school.name)
      const schoolTotalPoints = schoolStudents.reduce((sum, s) => sum + s.ecoPoints, 0)
      const schoolAvgPoints = schoolStudents.length > 0 ? Math.round(schoolTotalPoints / schoolStudents.length) : 0
      const schoolSubmissions = submissions.filter(s => schoolStudents.some(st => st.id === s.studentId))
      return {
        name: school.name,
        studentCount: schoolStudents.length,
        teacherCount: teachers.filter(t => t.school === school.name).length,
        totalPoints: schoolTotalPoints,
        avgPoints: schoolAvgPoints,
        submissions: schoolSubmissions.length,
        isActive: school.isActive
      }
    }).sort((a, b) => b.totalPoints - a.totalPoints)

    // Lessons completed per student
    const avgLessonsCompleted = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.completedLessons?.length || 0), 0) / students.length * 10) / 10
      : 0

    // Badges statistics
    const totalBadgesEarned = students.reduce((sum, s) => sum + (s.badges?.length || 0), 0)
    const avgBadges = students.length > 0 ? Math.round(totalBadgesEarned / students.length * 10) / 10 : 0

    return {
      totalPoints, avgPoints, maxPoints, topStudents, pointsRanges, maxRangeCount,
      avgStreak, maxStreak, activeStreaks,
      approvedSubmissions, pendingSubmissions, rejectedSubmissions, totalSubmissions, approvalRate,
      tasksByCategory,
      schoolPerformance,
      avgLessonsCompleted, totalBadgesEarned, avgBadges,
      totalLessons: lessons.length, totalTasks: tasks.length
    }
  }, [users, schools, submissions, tasks, lessons])

  const handleLogout = () => {
    sessionStorage.removeItem('ecocred_current_user')
    window.location.href = '/login'
  }

  const handleWipeData = async () => {
    if (confirm('⚠️ WARNING: This will permanently delete ALL data from MongoDB including users, tasks, submissions, and all other data. This action cannot be undone. Are you absolutely sure?')) {
      if (confirm('This is your final warning. Click OK to permanently delete ALL data.')) {
        try {
          await wipeAllData()
          alert('All data has been wiped from MongoDB. The page will reload.')
          window.location.reload()
        } catch (error) {
          console.error('Error wiping data:', error)
          alert('Error wiping data. Please try again.')
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage schools, users, and system settings</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleWipeData} variant="destructive" className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Wipe All Data</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">All platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schools</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">Registered schools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <UserIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">Active teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Settings className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="school-data">School Data</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">School Management</h2>
              <Button onClick={() => setShowSchoolForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school) => (
                <Card key={school.id} className="hover-lift">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{school.location}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSchool(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchool(school.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Students:</span>
                        <Badge variant="secondary">
                          {users.filter(u => u.school === school.name && u.role === 'student').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Teachers:</span>
                        <Badge variant="secondary">
                          {users.filter(u => u.school === school.name && u.role === 'teacher').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={school.isActive ? "default" : "destructive"}>
                          {school.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* School Data Tab */}
          <TabsContent value="school-data" className="space-y-6">
            <SchoolDataList />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {["all", "student", "teacher", "admin"].map(role => (
                    <Button
                      key={role}
                      variant={roleFilter === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRoleFilter(role)}
                      className="capitalize"
                    >
                      {role === "all" ? "All" : role + "s"}
                    </Button>
                  ))}
                </div>
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              Showing {filteredUsers.length} of {users.length} users
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.school}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.ecoPoints} points</p>
                          <p className="text-xs text-muted-foreground">{user.streak} day streak</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Badges: {user.badges?.length || 0}</p>
                          <p>Lessons: {user.completedLessons?.length || 0}</p>
                        </div>
                        {user.role !== 'admin' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deletingUser === user.id}
                            className="ml-2"
                          >
                            {deletingUser === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>

            {/* Overview KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-amber-600">{analytics.totalPoints}</div>
                  <div className="text-xs text-muted-foreground">Total Eco-Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-purple-600">{analytics.avgPoints}</div>
                  <div className="text-xs text-muted-foreground">Avg Points/Student</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-orange-600">{analytics.maxStreak}</div>
                  <div className="text-xs text-muted-foreground">Highest Streak</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-600">{analytics.approvalRate}%</div>
                  <div className="text-xs text-muted-foreground">Approval Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalBadgesEarned}</div>
                  <div className="text-xs text-muted-foreground">Badges Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-6 w-6 text-teal-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-teal-600">{analytics.avgLessonsCompleted}</div>
                  <div className="text-xs text-muted-foreground">Avg Lessons/Student</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Points Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.pointsRanges.map(range => (
                      <div key={range.label} className="flex items-center gap-3">
                        <span className="text-xs font-mono w-16 text-right text-muted-foreground">{range.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{ width: `${Math.max((range.count / analytics.maxRangeCount) * 100, range.count > 0 ? 15 : 0)}%` }}
                          >
                            {range.count > 0 && <span className="text-[10px] font-bold text-white">{range.count}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{analytics.avgPoints}</div>
                      <div className="text-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{analytics.maxPoints}</div>
                      <div className="text-xs text-muted-foreground">Highest</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{stats.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Total Students</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span>Top 10 Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.topStudents.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topStudents.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-amber-400 text-amber-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-300 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.school}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{student.ecoPoints} pts</p>
                            <p className="text-xs text-muted-foreground">{student.badges?.length || 0} badges</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-40" />
                      <p>No student data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submissions Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span>Submissions Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-xl bg-green-50 border border-green-200">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-600">{analytics.approvedSubmissions}</div>
                      <div className="text-xs text-green-700">Approved</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                      <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-yellow-600">{analytics.pendingSubmissions}</div>
                      <div className="text-xs text-yellow-700">Pending</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-red-600">{analytics.rejectedSubmissions}</div>
                      <div className="text-xs text-red-700">Rejected</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Approved</span>
                        <span className="font-medium">{analytics.approvalRate}%</span>
                      </div>
                      <Progress value={analytics.approvalRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-yellow-600">Pending</span>
                        <span className="font-medium">{analytics.totalSubmissions > 0 ? Math.round((analytics.pendingSubmissions / analytics.totalSubmissions) * 100) : 0}%</span>
                      </div>
                      <Progress value={analytics.totalSubmissions > 0 ? (analytics.pendingSubmissions / analytics.totalSubmissions) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-center">
                    <div className="text-3xl font-bold text-primary">{analytics.totalSubmissions}</div>
                    <div className="text-sm text-muted-foreground">Total Submissions</div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks & Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-500" />
                    <span>Content & Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                      <div className="text-2xl font-bold text-indigo-600">{analytics.totalTasks}</div>
                      <div className="text-xs text-indigo-700">Total Tasks</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-teal-50 border border-teal-200">
                      <div className="text-2xl font-bold text-teal-600">{analytics.totalLessons}</div>
                      <div className="text-xs text-teal-700">Total Lessons</div>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold mb-3">Tasks by Category</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.tasksByCategory).map(([category, count]) => {
                      const colors: Record<string, string> = {
                        planting: 'bg-green-500', waste: 'bg-orange-500', energy: 'bg-yellow-500', water: 'bg-blue-500'
                      }
                      const icons: Record<string, string> = {
                        planting: '🌳', waste: '♻️', energy: '⚡', water: '💧'
                      }
                      return (
                        <div key={category} className="flex items-center gap-3">
                          <span className="text-lg">{icons[category] || '📋'}</span>
                          <span className="text-sm capitalize w-20">{category}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[category] || 'bg-gray-400'}`}
                              style={{ width: `${analytics.totalTasks > 0 ? ((count as number) / analytics.totalTasks) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-8 text-right">{count as number}</span>
                        </div>
                      )
                    })}
                    {Object.keys(analytics.tasksByCategory).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks created yet</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Engagement Metrics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">{analytics.activeStreaks}</div>
                        <div className="text-[10px] text-muted-foreground">Active Streaks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{analytics.avgStreak}</div>
                        <div className="text-[10px] text-muted-foreground">Avg Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{analytics.avgBadges}</div>
                        <div className="text-[10px] text-muted-foreground">Avg Badges</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Performance Comparison */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span>School Performance Comparison</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.schoolPerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-semibold">Rank</th>
                            <th className="text-left py-3 px-2 font-semibold">School</th>
                            <th className="text-center py-3 px-2 font-semibold">Students</th>
                            <th className="text-center py-3 px-2 font-semibold">Teachers</th>
                            <th className="text-center py-3 px-2 font-semibold">Total Points</th>
                            <th className="text-center py-3 px-2 font-semibold">Avg Points</th>
                            <th className="text-center py-3 px-2 font-semibold">Submissions</th>
                            <th className="text-center py-3 px-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.schoolPerformance.map((school, index) => (
                            <tr key={school.name} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-amber-400 text-amber-900' :
                                  index === 1 ? 'bg-gray-300 text-gray-700' :
                                  index === 2 ? 'bg-orange-300 text-orange-800' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-3 px-2 font-medium">{school.name}</td>
                              <td className="py-3 px-2 text-center">{school.studentCount}</td>
                              <td className="py-3 px-2 text-center">{school.teacherCount}</td>
                              <td className="py-3 px-2 text-center font-bold text-primary">{school.totalPoints}</td>
                              <td className="py-3 px-2 text-center">{school.avgPoints}</td>
                              <td className="py-3 px-2 text-center">{school.submissions}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge variant={school.isActive ? "default" : "destructive"} className="text-xs">
                                  {school.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                      <p>No school data available. Create schools to see performance comparisons.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>

        {/* School Form Modal */}
        {showSchoolForm && (
          <SchoolForm
            school={null}
            onSave={handleCreateSchool}
            onCancel={() => setShowSchoolForm(false)}
          />
        )}

        {/* Edit School Modal */}
        {editingSchool && (
          <SchoolForm
            school={editingSchool}
            onSave={(data) => handleUpdateSchool(editingSchool.id, data)}
            onCancel={() => setEditingSchool(null)}
          />
        )}
      </div>
    </div>
  )
}

// School Form Component
function SchoolForm({ 
  school, 
  onSave, 
  onCancel 
}: { 
  school: School | null
  onSave: (data: Omit<School, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: school?.name || '',
    location: school?.location || '',
    description: school?.description || '',
    isActive: school?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      createdAt: school?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{school ? 'Edit School' : 'Add New School'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {school ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
