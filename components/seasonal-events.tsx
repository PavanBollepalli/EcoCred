"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Award,
  Calendar,
  Clock,
  Sparkles,
  Crown
} from "lucide-react"
import { getSeasonalEvents, createSeasonalEvent, updateSeasonalEvent, deleteSeasonalEvent } from "@/lib/storage-api"
import type { SeasonalEvent } from "@/lib/types"

interface SeasonalEventsProps {
  userRole?: string
}

export function SeasonalEvents({ userRole }: SeasonalEventsProps) {
  const [events, setEvents] = useState<SeasonalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SeasonalEvent | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const seasonalEvents = await getSeasonalEvents()
      setEvents(seasonalEvents)
    } catch (error) {
      console.error('Error loading seasonal events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (eventData: Omit<SeasonalEvent, 'id'>) => {
    try {
      await createSeasonalEvent(eventData)
      await loadEvents()
      setShowEventForm(false)
    } catch (error) {
      console.error('Error creating seasonal event:', error)
    }
  }

  const handleUpdateEvent = async (eventData: Omit<SeasonalEvent, 'id'>) => {
    try {
      if (editingEvent) {
        await updateSeasonalEvent(editingEvent.id, eventData)
        await loadEvents()
        setEditingEvent(null)
      }
    } catch (error) {
      console.error('Error updating seasonal event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        await deleteSeasonalEvent(eventId)
        await loadEvents()
      }
    } catch (error) {
      console.error('Error deleting seasonal event:', error)
    }
  }

  const getEventStatus = (event: SeasonalEvent) => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    if (now < startDate) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' }
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Active' }
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800', label: 'Ended' }
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
            <Gift className="h-6 w-6 text-purple-500" />
            <span>Seasonal Events</span>
          </h2>
          <p className="text-muted-foreground">Special events with exclusive rewards and community challenges</p>
        </div>
        {(userRole === 'teacher' || userRole === 'admin') && (
          <Button onClick={() => setShowEventForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Active Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const eventStatus = getEventStatus(event)
          const daysRemaining = getDaysRemaining(event.endDate)
          const isActive = eventStatus.status === 'active'

          return (
            <Card key={event.id} className={`hover-lift ${isActive ? 'ring-2 ring-purple-200' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <Badge className={eventStatus.color}>
                        {eventStatus.label}
                      </Badge>
                    </div>
                  </div>
                  {(userRole === 'teacher' || userRole === 'admin') && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                
                {/* Event Duration */}
                <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Days Remaining */}
                {isActive && (
                  <div className="flex items-center space-x-2 mb-4 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ends today!'}
                    </span>
                  </div>
                )}

                {/* Rewards */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>Exclusive Rewards</span>
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{event.rewards.points} bonus points</span>
                    </div>
                    {event.rewards.badges.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Crown className="h-3 w-3 text-purple-500" />
                        <span>{event.rewards.badges.join(', ')} badges</span>
                      </div>
                    )}
                    {event.rewards.specialItems.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Gift className="h-3 w-3 text-green-500" />
                        <span>{event.rewards.specialItems.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-4" 
                  variant={isActive ? "default" : "outline"}
                  disabled={!isActive}
                >
                  {isActive ? 'Participate Now' : 'Event Ended'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Events State */}
      {events.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Seasonal Events</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === 'teacher' || userRole === 'admin' 
                ? 'Create exciting seasonal events to boost community engagement and provide special rewards!'
                : 'No seasonal events available at the moment. Check back later for exciting community events!'
              }
            </p>
            {(userRole === 'teacher' || userRole === 'admin') && (
              <Button onClick={() => setShowEventForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <SeasonalEventForm
          event={null}
          onSave={handleCreateEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <SeasonalEventForm
          event={editingEvent}
          onSave={handleUpdateEvent}
          onCancel={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}

// Seasonal Event Form Component
function SeasonalEventForm({ 
  event, 
  onSave, 
  onCancel 
}: { 
  event: SeasonalEvent | null
  onSave: (data: Omit<SeasonalEvent, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
    rewards: {
      points: event?.rewards.points || 0,
      badges: event?.rewards.badges || [],
      specialItems: event?.rewards.specialItems || []
    },
    isActive: event?.isActive ?? true
  })

  const [newBadge, setNewBadge] = useState('')
  const [newItem, setNewItem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      createdAt: event?.createdAt || new Date().toISOString()
    })
  }

  const addBadge = () => {
    if (newBadge.trim()) {
      setFormData({
        ...formData,
        rewards: {
          ...formData.rewards,
          badges: [...formData.rewards.badges, newBadge.trim()]
        }
      })
      setNewBadge('')
    }
  }

  const removeBadge = (index: number) => {
    setFormData({
      ...formData,
      rewards: {
        ...formData.rewards,
        badges: formData.rewards.badges.filter((_: string, i: number) => i !== index)
      }
    })
  }

  const addItem = () => {
    if (newItem.trim()) {
      setFormData({
        ...formData,
        rewards: {
          ...formData.rewards,
          specialItems: [...formData.rewards.specialItems, newItem.trim()]
        }
      })
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      rewards: {
        ...formData.rewards,
        specialItems: formData.rewards.specialItems.filter((_: string, i: number) => i !== index)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-500" />
            <span>{event ? 'Edit Seasonal Event' : 'Create Seasonal Event'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Earth Day Celebration"
                  required
                />
              </div>
              <div>
                <Label htmlFor="points">Bonus Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.rewards.points}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    rewards: { ...formData.rewards, points: parseInt(e.target.value) || 0 }
                  })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event and its goals..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Badges */}
            <div>
              <Label>Special Badges</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="Add badge name..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
                />
                <Button type="button" onClick={addBadge} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.rewards.badges.map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{badge}</span>
                    <button
                      type="button"
                      onClick={() => removeBadge(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Special Items */}
            <div>
              <Label>Special Items</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add special item..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                />
                <Button type="button" onClick={addItem} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.rewards.specialItems.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active Event</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                {event ? 'Update Event' : 'Create Event'}
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
