"use client"

import { useState, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Image as ImageIcon, 
  Search, 
  Filter,
  Calendar,
  User as UserIcon,
  MapPin,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  Eye,
  Download,
  X,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { getSubmissions, getTasks, getUsers, deleteSubmission, getCurrentUserFromSession } from "@/lib/storage-api"
import type { Submission, Task, User } from "@/lib/storage-api"
import { ImageGallery } from "@/components/image-upload"

interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
  uploadedBy: string
  uploadedAt: string
  category: string
  location?: string
  status: string
  studentName: string
  taskTitle: string
  submissionId?: string
}

export default function GalleryPage() {
  return (
    <AuthGuard>
      <GalleryView />
    </AuthGuard>
  )
}

function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const currentUser = getCurrentUserFromSession()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    loadGalleryData()
  }, [])

  const loadGalleryData = async () => {
    try {
      const [submissions, tasks, users, imagesResponse] = await Promise.all([
        getSubmissions(),
        getTasks(),
        getUsers(),
        fetch('/api/images?isPublic=true').then(res => res.json())
      ])

      console.log('Gallery Debug:', {
        submissions: submissions.length,
        tasks: tasks.length,
        users: users.length,
        imagesResponse: imagesResponse.length,
        imagesResponseData: imagesResponse
      })

      // Create gallery images from both imageUploads and submissions with evidence
      const galleryImages: GalleryImage[] = []
      
      // Add images from imageUploads collection
      imagesResponse
        .filter((image: any) => image.isPublic)
        .forEach((image: any) => {
          const submission = submissions.find(s => s.evidence === image.url)
          const task = tasks.find(t => t.id === image.taskId || (submission && t.id === submission.taskId))
          const user = users.find(u => u.id === image.uploadedBy || (submission && u.id === submission.studentId))
          
          galleryImages.push({
            id: image.id,
            url: image.url,
            title: task?.title || 'Unknown Task',
            description: submission?.description || '',
            uploadedBy: user?.name || 'Unknown User',
            uploadedAt: image.uploadedAt,
            category: task?.category || 'unknown',
            location: submission?.location || '',
            status: submission?.status || 'unknown',
            studentName: user?.name || 'Unknown User',
            taskTitle: task?.title || 'Unknown Task',
            submissionId: submission?.id
          })
        })

      // Add images from submissions that have evidence (image URLs)
      submissions
        .filter(submission => submission.evidence && submission.status === 'approved')
        .forEach(submission => {
          const task = tasks.find(t => t.id === submission.taskId)
          const user = users.find(u => u.id === submission.studentId)
          
          // Check if this image is already added from imageUploads
          const alreadyExists = galleryImages.some(img => img.url === submission.evidence)
          
          if (!alreadyExists && task) {
            galleryImages.push({
              id: submission.id,
              url: submission.evidence,
              title: task.title,
              description: submission.description || '',
              uploadedBy: user?.name || 'Unknown User',
              uploadedAt: submission.submittedAt,
              category: task.category,
              location: submission.location || '',
              status: submission.status,
              studentName: user?.name || 'Unknown User',
              taskTitle: task.title,
              submissionId: submission.id
            })
          }
        })

      // Sort by upload date
      galleryImages.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

      console.log('Processed gallery images:', galleryImages.length, galleryImages)

      setImages(galleryImages)
    } catch (error) {
      console.error('Error loading gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = images

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => image.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(image => image.status === selectedStatus)
    }

    setFilteredImages(filtered)
  }

  useEffect(() => {
    filterImages()
  }, [images, searchTerm, selectedCategory, selectedStatus])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting':
        return <TreePine className="h-4 w-4 text-green-600" />
      case 'waste':
        return <Recycle className="h-4 w-4 text-blue-600" />
      case 'energy':
        return <Zap className="h-4 w-4 text-yellow-600" />
      case 'water':
        return <Droplets className="h-4 w-4 text-cyan-600" />
      default:
        return <ImageIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteImage = async (image: GalleryImage) => {
    if (!image.submissionId) {
      console.error('No submission ID found for image')
      alert('Error: No submission ID found for this image.')
      return
    }

    setDeleting(true)
    try {
      console.log('Attempting to delete submission:', image.submissionId)
      const response = await deleteSubmission(image.submissionId)
      console.log('Delete response:', response)
      
      // Show success message with details
      if (response && response.pointsDeducted) {
        alert(`Task submission deleted successfully!\n\n- ${response.pointsDeducted} points deducted from student\n- Student stats updated\n- Global statistics updated\n- Image permanently removed from storage`)
      } else {
        alert('Task submission deleted successfully!')
      }
      
      // Reload the gallery data
      await loadGalleryData()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting submission:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete the task.\n\nError: ${errorMessage}\n\nPlease check the console for more details and try again.`)
    } finally {
      setDeleting(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'planting', label: 'Planting' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'energy', label: 'Energy Conservation' },
    { value: 'water', label: 'Water Conservation' }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Task Gallery</h1>
          <p className="text-muted-foreground">Explore environmental actions from students across all schools</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{images.length}</p>
                  <p className="text-sm text-muted-foreground">Total Images</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {images.filter(img => img.category === 'planting').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Planting Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Recycle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {images.filter(img => img.category === 'waste').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Waste Management</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {images.filter(img => img.category === 'energy' || img.category === 'water').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Conservation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by task, student, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden hover-lift cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex space-x-1">
                  {getCategoryIcon(image.category)}
                  <Badge className={getStatusColor(image.status)}>
                    {image.status}
                  </Badge>
                </div>
                {isAdmin && image.status === 'approved' && (
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(image)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm truncate mb-1">{image.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">By {image.studentName}</p>
                {image.location && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{image.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters to see more images"
                  : "No task images have been submitted yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(selectedImage.category)}
                    <span>{selectedImage.title}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    By {selectedImage.studentName} • {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="aspect-square lg:aspect-auto">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedImage.status)}>
                        {selectedImage.status}
                      </Badge>
                      {getCategoryIcon(selectedImage.category)}
                      <span className="text-sm capitalize">{selectedImage.category}</span>
                    </div>
                    
                    {selectedImage.location && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedImage.location}</span>
                      </div>
                    )}
                    
                    {selectedImage.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedImage.description}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(selectedImage.url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                      {isAdmin && selectedImage.status === 'approved' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedImage(null)
                            setDeleteConfirm(selectedImage)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Delete Task Submission</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-2">
                    ⚠️ This action will permanently delete:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Task submission record</li>
                    <li>• Student&apos;s earned points for this task</li>
                    <li>• Student&apos;s streak counter (decremented)</li>
                    <li>• Image file from storage</li>
                    <li>• Global statistics impact</li>
                    <li>• Any badges earned from this submission</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium text-sm">{deleteConfirm.title}</p>
                  <p className="text-xs text-muted-foreground">By {deleteConfirm.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(deleteConfirm.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Category: {deleteConfirm.category}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The student will lose all points and progress associated with this submission.
                </p>
                
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteImage(deleteConfirm)}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
