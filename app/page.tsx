"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InteractiveMap } from "@/components/interactive-map"
import Galaxy from "@/components/galaxy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Leaf, TreePine, Recycle, Users, Trophy, Star } from "lucide-react"
import { getGlobalStats, getUsers, getSchoolRankings } from "@/lib/storage-api"
import type { GlobalStats, User, School } from "@/lib/storage-api"
import Link from "next/link"

export default function HomePage() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [topStudents, setTopStudents] = useState<User[]>([])
  const [topSchools, setTopSchools] = useState<Array<{school: School, totalPoints: number, studentCount: number}>>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load stats from MongoDB
    const loadData = async () => {
      try {
        const globalStats = await getGlobalStats()
        const users = await getUsers()
        
        // Calculate top students
        const studentUsers = users.filter((user) => user.role === "student")
        const sortedStudents = studentUsers.sort((a, b) => b.ecoPoints - a.ecoPoints).slice(0, 5)

        // Get school rankings
        const schoolRankings = await getSchoolRankings(5)

        setStats(globalStats)
        setTopStudents(sortedStudents)
        setTopSchools(schoolRankings)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  if (!isLoaded || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-primary text-primary-foreground overflow-hidden">
        {/* Galaxy Background */}
        <div className="absolute inset-0 opacity-30">
          <Galaxy 
            density={1.5}
            glowIntensity={0.8}
            hueShift={0}
            speed={0.3}
            mouseInteraction={true}
            transparent={true}
            twinkleIntensity={1.0}
            repulsionStrength={4}
            starSpeed={0.2}
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 text-primary-foreground mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">EcoCred Web</h1>
          </div>
          <p className="text-xl md:text-2xl text-primary-foreground mb-8 max-w-3xl mx-auto opacity-90">
            Gamified Environmental Education & Verified Actions Platform
          </p>
          <p className="text-lg text-primary-foreground mb-12 max-w-2xl mx-auto opacity-80">
            Join students and teachers worldwide in making a real environmental impact through verified actions,
            interactive learning, and community engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link href="/student">Join as Student</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/teacher">Teacher Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Global Impact This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader className="pb-3">
                <TreePine className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold text-primary">
                  {stats?.totalSaplings?.toLocaleString() || '0'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Saplings Planted</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Recycle className="h-8 w-8 text-secondary mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold text-secondary">{stats?.totalWasteSaved || 0} kg</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Waste Saved</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold text-accent">{stats?.totalStudents?.toLocaleString() || '0'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Active Students</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-2xl font-bold text-primary">{stats?.totalTasks || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tasks Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Impact Map */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Interactive Impact Map</h2>
          <InteractiveMap />
        </div>
      </section>

      {/* Student Profiles & School Rankings */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Top Environmental Champions</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Meet our top students and see which schools are leading the environmental movement
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Student Rankings - Takes 2 columns */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Star className="h-5 w-5 text-primary" />
                <span>Student Leaderboard</span>
              </h3>
              {topStudents.length > 0 ? (
                <div className="space-y-4">
                  {topStudents.slice(0, 8).map((student, index) => (
                    <Card key={student.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {/* Rank Badge */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-amber-600"
                                    : "bg-primary"
                            }`}
                          >
                            {index + 1}
                          </div>
                          
                          {/* Student Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">Level {student.level || 1} Student</p>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-6 flex-shrink-0">
                            <div className="text-center">
                              <div className="text-xl font-bold text-primary">{student.ecoPoints}</div>
                              <div className="text-xs text-muted-foreground">Points</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-orange-500">{student.streak}</div>
                              <div className="text-xs text-muted-foreground">Streak</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">{student.completedLessons?.length || 0}</div>
                              <div className="text-xs text-muted-foreground">Lessons</div>
                            </div>
                          </div>
                          
                          {/* Badges */}
                          <div className="flex-shrink-0">
                            {student.badges.length > 0 ? (
                              <div className="flex space-x-1">
                                {student.badges.slice(0, 2).map((badge, badgeIndex) => (
                                  <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                    {badge}
                                  </Badge>
                                ))}
                                {student.badges.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{student.badges.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                New Member
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to join our environmental community!</p>
                  <Button asChild size="lg">
                    <Link href="/student">Join as Student</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* School Rankings - Takes 1 column */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>School Rankings</span>
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {topSchools.length > 0 ? (
                      topSchools.map((ranking, index) => {
                        const rankColors = [
                          "bg-yellow-500", // 1st place - Gold
                          "bg-gray-400",   // 2nd place - Silver
                          "bg-amber-600",  // 3rd place - Bronze
                          "bg-primary",    // 4th place
                          "bg-blue-500"    // 5th place
                        ]
                        
                        const maxPoints = topSchools[0]?.totalPoints || 1
                        const progressValue = (ranking.totalPoints / maxPoints) * 100
                        
                        return (
                          <div key={ranking.school.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full ${rankColors[index] || "bg-gray-400"} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{ranking.school.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ranking.totalPoints.toLocaleString()} points
                                </p>
                              </div>
                            </div>
                            <div className="ml-11">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{ranking.studentCount} students</span>
                                <span>{Math.round(progressValue)}%</span>
                              </div>
                              <Progress value={progressValue} className="h-2" />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No school rankings available yet</p>
                        <p className="text-xs">Schools will appear here once students start earning eco-points</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students and teachers making a real difference for our planet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/student">Start Learning</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              <Link href="/teacher">Teach & Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

