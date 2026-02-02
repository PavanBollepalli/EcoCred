"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  X
} from "lucide-react"
import { getAnnouncements, createAnnouncement, getCurrentUserFromSession } from "@/lib/storage-api"
import type { Announcement } from "@/lib/types"

interface AnnouncementsProps {
  schoolId?: string
  targetAudience?: string
  showAddButton?: boolean
  userRole?: string
}

export function Announcements({ schoolId, targetAudience, showAddButton = true, userRole }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadAnnouncements = useCallback(async () => {
    try {
      const announcementData = await getAnnouncements(schoolId, targetAudience)
      setAnnouncements(announcementData)
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }, [schoolId, targetAudience])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const handleCreateAnnouncement = async (announcementData: Omit<Announcement, 'id'>) => {
    try {
      await createAnnouncement(announcementData)
      await loadAnnouncements()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-blue-500" />
            <span>Announcements</span>
          </h2>
          <p className="text-muted-foreground">Important updates and motivational messages</p>
        </div>
        {showAddButton && (userRole === 'teacher' || userRole === 'admin') && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground mb-4">
                {showAddButton ? 'Create your first announcement to keep everyone informed!' : 'No announcements available at the moment.'}
              </p>
              {showAddButton && (userRole === 'teacher' || userRole === 'admin') && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                      {announcement.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{announcement.authorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(announcement.createdAt)}</span>
                      </div>
                      {announcement.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <X className="h-3 w-3" />
                          <span>Expires {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showAddButton && (userRole === 'teacher' || userRole === 'admin') && (
                    <div className="flex space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <AnnouncementForm
          onSave={handleCreateAnnouncement}
          onCancel={() => setShowForm(false)}
          schoolId={schoolId}
          targetAudience={targetAudience}
          userRole={userRole}
        />
      )}
    </div>
  )
}

// Announcement Form Component
function AnnouncementForm({ 
  onSave, 
  onCancel, 
  schoolId,
  targetAudience,
  userRole
}: { 
  onSave: (data: Omit<Announcement, 'id'>) => void
  onCancel: () => void
  schoolId?: string
  targetAudience?: string
  userRole?: string
}) {
  const currentUser = getCurrentUserFromSession()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    authorId: currentUser?.id || 'admin',
    authorName: currentUser?.name || 'Admin',
    schoolId: schoolId || '',
    targetAudience: targetAudience || 'all' as Announcement['targetAudience'],
    priority: 'medium' as Announcement['priority'],
    isActive: true,
    expiresAt: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      targetAudience: formData.targetAudience as Announcement['targetAudience'],
      priority: formData.priority as Announcement['priority'],
      createdAt: new Date().toISOString(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-blue-500" />
            <span>Create Announcement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your announcement message..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <select
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Announcement['targetAudience'] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="specific_school">Specific School</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Announcement['priority'] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Publish immediately</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Publish Announcement
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
