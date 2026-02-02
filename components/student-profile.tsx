"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  School, 
  Calendar, 
  Award, 
  Trophy, 
  Flame, 
  Edit, 
  Save, 
  X,
  MapPin,
  Phone,
  GraduationCap,
  Star,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Activity
} from "lucide-react"
import { getCurrentUserFromSession, saveUser } from "@/lib/storage-api"
import type { User as UserType } from "@/lib/storage-api"

interface StudentProfileProps {
  user: UserType
  onUpdate?: (updatedUser: UserType) => void
}

export function StudentProfile({ user, onUpdate }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserType>(user)

  const handleSave = async () => {
    try {
      await saveUser(editedUser)
      if (onUpdate) {
        onUpdate(editedUser)
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Profile Information</span>
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <School className="h-4 w-4 text-muted-foreground" />
                <span>{user.school || 'Not specified'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinedDate">Joined Date</Label>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastActive">Last Active</Label>
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{user.lastActive ? formatDate(user.lastActive) : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={editedUser.bio || ''}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md min-h-[80px]">
                <p className="text-sm text-muted-foreground">
                  {user.bio || 'No bio available. Click edit to add one!'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Eco Points</p>
                <p className="text-2xl font-bold text-primary">{user.ecoPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Streak</p>
                <p className="text-2xl font-bold text-primary">{user.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Badges</p>
                <p className="text-2xl font-bold text-primary">{user.badges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Level</p>
                <p className="text-2xl font-bold text-primary">{user.level || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Earned Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No badges earned yet. Complete tasks to earn your first badge!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Eco Warrior</p>
                  <p className="text-sm text-muted-foreground">Earned {user.ecoPoints} eco points</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Streak Master</p>
                  <p className="text-sm text-muted-foreground">{user.streak} day streak</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            {user.badges.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Badge Collector</p>
                    <p className="text-sm text-muted-foreground">Earned {user.badges.length} badges</p>
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Learning Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Completed Lessons</p>
                  <p className="text-sm text-muted-foreground">{user.completedLessons?.length || 0} lessons finished</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {user.completedLessons?.length || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Learning Goals</p>
                  <p className="text-sm text-muted-foreground">Complete 10 lessons to unlock next level</p>
                </div>
              </div>
              <Badge variant="outline">
                {((user.completedLessons?.length || 0) / 10) * 100}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Progress Rate</p>
                  <p className="text-sm text-muted-foreground">Average {user.streak} lessons per week</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Excellent
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Activity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-lg font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Unknown'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Active</span>
              </div>
              <p className="text-lg font-bold">
                {user.lastActive ? new Date(user.lastActive).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Today'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Current Level</span>
              </div>
              <p className="text-lg font-bold">Level {user.level || 1}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Points</span>
              </div>
              <p className="text-lg font-bold">{user.ecoPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
