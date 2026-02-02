"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TreePine, Recycle, Zap, Droplets, Users, Maximize2 } from "lucide-react"
import { getSubmissions, getTasks, getUsers, getSchools } from "@/lib/storage-api"

interface MapPoint {
  id: string
  lat: number
  lng: number
  type: "planting" | "waste" | "energy" | "water"
  title: string
  studentName: string
  date: string
  points: number
}

export function InteractiveMap() {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    // Generate map points from approved submissions with real data
    const loadMapData = async () => {
      try {
        const submissions = await getSubmissions()
        const tasks = await getTasks()
        const users = await getUsers()
        const schools = await getSchools()
        
        const approvedSubmissions = submissions.filter((s) => s.status === "approved")

        const points: MapPoint[] = approvedSubmissions.map((submission, index) => {
          const task = tasks.find((t) => t.id === submission.taskId)
          const user = users.find((u) => u.id === submission.studentId)
          const school = schools.find((s) => s.name === user?.school)

          // Use school location if available, otherwise use Indian cities as fallback
          const indianCities = [
            { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
            { name: "Mumbai", lat: 19.076, lng: 72.8777 },
            { name: "Delhi", lat: 28.6139, lng: 77.209 },
            { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
            { name: "Pune", lat: 18.5204, lng: 73.8567 },
            { name: "Amritsar", lat: 31.634, lng: 74.8723 },
            { name: "Ludhiana", lat: 30.9010, lng: 75.8573 },
            { name: "Patiala", lat: 30.3398, lng: 76.3869 },
            { name: "Mohali", lat: 30.7046, lng: 76.7179 },
          ]

          // Try to get coordinates from school location, fallback to city-based coordinates
          let lat, lng
          if (school?.location) {
            // For now, use city-based coordinates based on school location
            const city = indianCities.find(c => school.location.includes(c.name)) || indianCities[index % indianCities.length]
            lat = city.lat + (Math.random() - 0.5) * 0.05 // Smaller random offset for more accurate positioning
            lng = city.lng + (Math.random() - 0.5) * 0.05
          } else {
            const city = indianCities[index % indianCities.length]
            lat = city.lat + (Math.random() - 0.5) * 0.1
            lng = city.lng + (Math.random() - 0.5) * 0.1
          }

          return {
            id: submission.id,
            lat,
            lng,
            type: task?.category || "planting",
            title: task?.title || "Environmental Action",
            studentName: user?.name || "Unknown User", // Better fallback than "Anonymous"
            date: new Date(submission.submittedAt).toLocaleDateString(),
            points: task?.points || 0,
          }
        })

        setMapPoints(points)
      } catch (error) {
        console.error('Error loading map data:', error)
      }
    }

    loadMapData()
  }, [])

  const filteredPoints = filter === "all" ? mapPoints : mapPoints.filter((p) => p.type === filter)

  const getIconForType = (type: string) => {
    switch (type) {
      case "planting":
        return <TreePine className="h-4 w-4 text-primary" />
      case "waste":
        return <Recycle className="h-4 w-4 text-secondary" />
      case "energy":
        return <Zap className="h-4 w-4 text-yellow-500" />
      case "water":
        return <Droplets className="h-4 w-4 text-blue-500" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "planting":
        return "bg-primary"
      case "waste":
        return "bg-secondary"
      case "energy":
        return "bg-yellow-500"
      case "water":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>All ({mapPoints.length})</span>
        </Button>
        <Button
          variant={filter === "planting" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("planting")}
          className="flex items-center space-x-2"
        >
          <TreePine className="h-4 w-4" />
          <span>Planting ({mapPoints.filter((p) => p.type === "planting").length})</span>
        </Button>
        <Button
          variant={filter === "waste" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("waste")}
          className="flex items-center space-x-2"
        >
          <Recycle className="h-4 w-4" />
          <span>Waste ({mapPoints.filter((p) => p.type === "waste").length})</span>
        </Button>
        <Button
          variant={filter === "energy" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("energy")}
          className="flex items-center space-x-2"
        >
          <Zap className="h-4 w-4" />
          <span>Energy ({mapPoints.filter((p) => p.type === "energy").length})</span>
        </Button>
        <Button
          variant={filter === "water" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("water")}
          className="flex items-center space-x-2"
        >
          <Droplets className="h-4 w-4" />
          <span>Water ({mapPoints.filter((p) => p.type === "water").length})</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Global Impact Map</span>
              </div>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-96 overflow-hidden">
              {/* Simulated World Map Background */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Simplified world map outline */}
                  <path
                    d="M100 200 Q200 150 300 200 T500 180 Q600 160 700 200 L700 300 Q600 280 500 300 T300 320 Q200 340 100 300 Z"
                    fill="currentColor"
                    className="text-primary/30"
                  />
                  <path
                    d="M150 100 Q250 80 350 100 T550 90 Q650 70 750 100 L750 180 Q650 160 550 180 T350 200 Q250 220 150 180 Z"
                    fill="currentColor"
                    className="text-primary/20"
                  />
                </svg>
              </div>

              {/* Map Points */}
              <div className="absolute inset-0">
                {filteredPoints.map((point) => (
                  <div
                    key={point.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${((point.lng + 180) / 360) * 100}%`,
                      top: `${((90 - point.lat) / 180) * 100}%`,
                    }}
                    onClick={() => setSelectedPoint(point)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getColorForType(point.type)} animate-pulse hover:scale-150 transition-transform`}
                    />
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-semibold">Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Tree Planting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span>Waste Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Energy Conservation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Water Conservation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Point Details */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPoint ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getIconForType(selectedPoint.type)}
                  <h3 className="font-semibold">{selectedPoint.title}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Student:</span> {selectedPoint.studentName}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {selectedPoint.date}
                  </div>
                  <div>
                    <span className="font-medium">Points Earned:</span> {selectedPoint.points}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {selectedPoint.type}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Click on other points on the map to see more environmental actions from students around the world.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Click on a point on the map to see details</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Explore environmental actions from students worldwide
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
