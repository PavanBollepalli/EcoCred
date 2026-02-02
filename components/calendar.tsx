"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  AlertCircle,
  Gift,
  PartyPopper
} from "lucide-react"
import { getCalendarEvents, createCalendarEvent } from "@/lib/storage-api"
import type { CalendarEvent } from "@/lib/types"

interface CalendarProps {
  schoolId?: string
  showAddEvent?: boolean
  userRole?: string
}

export function Calendar({ schoolId, showAddEvent = true, userRole }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    try {
      const calendarEvents = await getCalendarEvents(schoolId)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventStart = new Date(event.startDate).toISOString().split('T')[0]
      const eventEnd = new Date(event.endDate).toISOString().split('T')[0]
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      await createCalendarEvent(eventData)
      await loadEvents()
      setShowEventForm(false)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case 'seasonal':
        return <Gift className="h-3 w-3 text-purple-500" />
      case 'holiday':
        return <PartyPopper className="h-3 w-3 text-yellow-500" />
      default:
        return <Clock className="h-3 w-3 text-blue-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'seasonal':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'holiday':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>Calendar</span>
            </CardTitle>
            {showAddEvent && (userRole === 'teacher' || userRole === 'admin') && (
              <Button onClick={() => setShowEventForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((day, index) => {
              if (!day) {
                return <div key={index} className="h-20"></div>
              }

              const dayEvents = getEventsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              const isSelected = selectedDate?.toDateString() === day.toDateString()

              return (
                <div
                  key={day.getDate()}
                  className={`h-20 p-1 border rounded cursor-pointer hover:bg-muted/50 ${
                    isToday ? 'bg-primary/10 border-primary' : ''
                  } ${isSelected ? 'bg-primary/20' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded border ${getEventColor(event.type)} truncate`}
                        title={event.title}
                      >
                        <div className="flex items-center space-x-1">
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onSave={handleCreateEvent}
          onCancel={() => setShowEventForm(false)}
          schoolId={schoolId}
        />
      )}

      {/* Event Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No events scheduled for this date
              </p>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getEventIcon(event.type)}
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant="outline" className={getEventColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString()} - 
                              {new Date(event.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Event Form Component
function EventForm({ 
  onSave, 
  onCancel, 
  schoolId 
}: { 
  onSave: (data: Omit<CalendarEvent, 'id'>) => void
  onCancel: () => void
  schoolId?: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'event' as CalendarEvent['type'],
    isAllDay: true,
    createdBy: 'admin' // This should come from current user context
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      schoolId,
      createdAt: new Date().toISOString(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Add Calendar Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <div>
              <Label htmlFor="type">Event Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                className="w-full p-2 border rounded-md"
              >
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="holiday">Holiday</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAllDay"
                checked={formData.isAllDay}
                onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isAllDay">All Day Event</Label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Create Event
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
