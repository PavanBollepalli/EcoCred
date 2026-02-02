"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Users, 
  GraduationCap, 
  User, 
  Search,
  MapPin,
  Calendar,
  Award,
  TrendingUp
} from "lucide-react"
import { getSchools, getUsers } from "@/lib/storage-api"
import type { School, User as UserType } from "@/lib/types"

interface SchoolData {
  school: School
  students: UserType[]
  teachers: UserType[]
  totalUsers: number
  totalPoints: number
  averagePoints: number
}

export function SchoolDataList() {
  const [schoolsData, setSchoolsData] = useState<SchoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadSchoolsData()
  }, [])

  const loadSchoolsData = async () => {
    try {
      setLoading(true)
      const [schools, users] = await Promise.all([
        getSchools(),
        getUsers()
      ])

      const schoolsData: SchoolData[] = schools.map(school => {
        const schoolUsers = users.filter(user => user.school === school.name)
        const students = schoolUsers.filter(user => user.role === "student")
        const teachers = schoolUsers.filter(user => user.role === "teacher")
        const totalPoints = schoolUsers.reduce((sum, user) => sum + user.ecoPoints, 0)
        const averagePoints = schoolUsers.length > 0 ? Math.round(totalPoints / schoolUsers.length) : 0

        return {
          school,
          students,
          teachers,
          totalUsers: schoolUsers.length,
          totalPoints,
          averagePoints
        }
      })

      setSchoolsData(schoolsData)
    } catch (error) {
      console.error("Error loading schools data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchools = schoolsData.filter(schoolData =>
    schoolData.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schoolData.school.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Schools Data</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading schools data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Schools Data</h2>
        </div>
        <Button onClick={loadSchoolsData} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search schools by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredSchools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "No schools match your search criteria." : "No schools have been registered yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredSchools.map((schoolData) => (
            <Card key={schoolData.school.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>{schoolData.school.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{schoolData.school.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(schoolData.school.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {schoolData.school.description && (
                      <p className="text-sm text-muted-foreground">
                        {schoolData.school.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={schoolData.school.isActive ? "default" : "secondary"}>
                    {schoolData.school.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{schoolData.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{schoolData.students.length}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{schoolData.teachers.length}</div>
                    <div className="text-sm text-muted-foreground">Teachers</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold">{schoolData.averagePoints}</div>
                    <div className="text-sm text-muted-foreground">Avg Points</div>
                  </div>
                </div>

                {schoolData.totalUsers > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Top Performers</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schoolData.students.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">Top Students</h5>
                          <div className="space-y-2">
                            {schoolData.students
                              .sort((a, b) => b.ecoPoints - a.ecoPoints)
                              .slice(0, 3)
                              .map((student, index) => (
                                <div key={student.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      #{index + 1}
                                    </Badge>
                                    <span className="text-sm font-medium">{student.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Award className="h-3 w-3 text-yellow-500" />
                                    <span className="text-sm font-medium">{student.ecoPoints}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {schoolData.teachers.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">Teachers</h5>
                          <div className="space-y-2">
                            {schoolData.teachers.map((teacher) => (
                              <div key={teacher.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div className="flex items-center space-x-2">
                                  <User className="h-3 w-3 text-green-600" />
                                  <span className="text-sm font-medium">{teacher.name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Award className="h-3 w-3 text-yellow-500" />
                                  <span className="text-sm font-medium">{teacher.ecoPoints}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
