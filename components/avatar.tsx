"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Camera, 
  Upload, 
  User, 
  Edit, 
  Check,
  X,
  Palette,
  Sparkles
} from "lucide-react"

interface AvatarProps {
  user: {
    id: string
    name: string
    role: string
    profilePicture?: string
    avatar?: string
  }
  size?: "sm" | "md" | "lg" | "xl"
  editable?: boolean
  onUpdate?: (avatar: string) => void
}

export function Avatar({ user, size = "md", editable = false, onUpdate }: AvatarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || user.profilePicture || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl"
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(selectedAvatar)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setSelectedAvatar(user.avatar || user.profilePicture || "")
    setIsEditing(false)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const predefinedAvatars = [
    "🌱", "🌿", "🌳", "🌻", "🦋", "🐝", "🌊", "☀️",
    "🌙", "⭐", "🌈", "🍃", "🌺", "🦎", "🐢", "🦜"
  ]

  return (
    <div className="relative">
      {isEditing ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>Choose Avatar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Avatar Preview */}
            <div className="flex justify-center">
              <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-4 border-primary`}>
                {selectedAvatar ? (
                  <img 
                    src={selectedAvatar} 
                    alt="Avatar preview" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Upload Custom Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Custom Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>

            {/* Predefined Avatars */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Or Choose from Eco-themed Avatars</Label>
              <div className="grid grid-cols-8 gap-2">
                {predefinedAvatars.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform ${
                      selectedAvatar === emoji ? 'ring-2 ring-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button onClick={handleSave} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative group">
          <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative overflow-hidden`}>
            {user.profilePicture || user.avatar ? (
              <img 
                src={user.profilePicture || user.avatar} 
                alt={`${user.name}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${getAvatarColor(user.name)} flex items-center justify-center`}>
                <span className="text-white font-bold">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
            
            {/* Role Badge */}
            <div className="absolute -bottom-1 -right-1">
              <Badge 
                variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}
                className="text-xs px-1 py-0"
              >
                {user.role === 'student' ? '👨‍🎓' : user.role === 'teacher' ? '👨‍🏫' : '👨‍💼'}
              </Badge>
            </div>
          </div>

          {/* Edit Button */}
          {editable && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Profile Card Component
interface ProfileCardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    school: string
    ecoPoints: number
    badges: string[]
    streak: number
    profilePicture?: string
    avatar?: string
  }
  showEditButton?: boolean
}

export function ProfileCard({ user, showEditButton = false }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar 
            user={user} 
            size="lg" 
            editable={showEditButton}
            onUpdate={(avatar) => {
              // Handle avatar update
              console.log('Avatar updated:', avatar)
            }}
          />
          <div className="flex-1">
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              <Badge variant="outline">
                {user.school}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{user.ecoPoints}</div>
            <div className="text-sm text-muted-foreground">Eco Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">{user.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">{user.badges.length}</div>
            <div className="text-sm text-muted-foreground">Badges</div>
          </div>
        </div>

        {/* Badges Display */}
        {user.badges.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Recent Badges</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.badges.slice(0, 5).map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
              {user.badges.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{user.badges.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
