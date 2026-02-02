"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  LogOut
} from "lucide-react"
import { getUsers, getSchools, createSchool, updateSchool, deleteSchool, wipeAllData } from "@/lib/storage-api"
import type { User, School } from "@/lib/storage-api"
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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, schoolsData] = await Promise.all([
        getUsers(),
        getSchools()
      ])
      setUsers(usersData)
      setSchools(schoolsData)
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.school?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalUsers: users.length,
    totalSchools: schools.length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalAdmins: users.filter(u => u.role === 'admin').length
  }

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="school-data">School Data</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>User Growth</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Leaderboard analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="EcoCred Web" />
                  </div>
                  <div>
                    <Label htmlFor="platform-description">Platform Description</Label>
                    <Textarea 
                      id="platform-description" 
                      defaultValue="Environmental education platform for schools"
                    />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Toggles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Chat Widget</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Leaderboard</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Notifications</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <Button>Update Features</Button>
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
