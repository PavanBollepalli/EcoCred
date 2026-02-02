"use client"

import { useState, useEffect } from "react"
import { Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSchools } from "@/lib/storage-api"
import type { School } from "@/lib/types"

interface SchoolSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SchoolSelect({
  value,
  onValueChange,
  placeholder = "Select school...",
  disabled = false,
  className
}: SchoolSelectProps) {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await getSchools()
        setSchools(schoolsData)
      } catch (error) {
        console.error("Error loading schools:", error)
        // Fallback to demo schools if API fails
        setSchools([
          { id: "demo1", name: "Demo School 1", location: "Demo City", description: "Demo school", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "demo2", name: "Demo School 2", location: "Demo City", description: "Demo school", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadSchools()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading schools..." : placeholder}>
          {value && schools.find(s => s.id === value)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {schools.map((school) => (
          <SelectItem key={school.id} value={school.id}>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <div>
                <div className="font-medium">{school.name}</div>
                <div className="text-sm text-muted-foreground">{school.location}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
