"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  CheckCircle, 
  Award, 
  Star,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  Calendar,
  X,
  AlertCircle
} from "lucide-react"
import { getCurrentUserFromSession } from "@/lib/storage-api"
import type { User } from "@/lib/storage-api"

interface Notification {
  id: string
  type: 'achievement' | 'task' | 'lesson' | 'streak' | 'badge' | 'reminder'
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: React.ReactNode
  color: string
}

export function NotificationCenter() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const currentUser = getCurrentUserFromSession()
    if (!currentUser) return

    setUser(currentUser)
    
    // Generate sample notifications based on user data
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: '🎉 Congratulations!',
        message: `You've earned ${currentUser.ecoPoints} eco points! Keep up the great work!`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        icon: <Star className="h-4 w-4" />,
        color: 'text-yellow-500'
      },
      {
        id: '2',
        type: 'badge',
        title: '🏆 New Badge Earned!',
        message: 'You\'ve unlocked the "Eco Warrior" badge for reaching 100+ points!',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        icon: <Award className="h-4 w-4" />,
        color: 'text-purple-500'
      },
      {
        id: '3',
        type: 'streak',
        title: '🔥 Streak Milestone!',
        message: `Amazing! You've maintained a ${currentUser.streak}-day activity streak!`,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-orange-500'
      },
      {
        id: '4',
        type: 'lesson',
        title: '📚 Lesson Available',
        message: 'New lesson "Water Conservation" is now available! Complete it to earn 16 points.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        icon: <Droplets className="h-4 w-4" />,
        color: 'text-blue-500'
      },
      {
        id: '5',
        type: 'task',
        title: '🌱 Task Reminder',
        message: 'Don\'t forget to complete your tree planting task! It\'s due tomorrow.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        icon: <TreePine className="h-4 w-4" />,
        color: 'text-green-500'
      },
      {
        id: '6',
        type: 'reminder',
        title: '⚡ Energy Saving Tip',
        message: 'Remember to turn off lights when leaving a room to save energy!',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        read: true,
        icon: <Zap className="h-4 w-4" />,
        color: 'text-yellow-600'
      }
    ]

    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'badge':
        return <Award className="h-4 w-4 text-purple-500" />
      case 'streak':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      case 'lesson':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'task':
        return <TreePine className="h-4 w-4 text-green-500" />
      case 'reminder':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">Complete tasks and lessons to get updates!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.read 
                      ? 'bg-muted/30 hover:bg-muted/50' 
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${notification.color}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
