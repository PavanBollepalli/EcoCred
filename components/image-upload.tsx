"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Check,
  AlertCircle
} from "lucide-react"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageId?: string) => void
  onImageRemoved?: () => void
  currentImage?: string
  disabled?: boolean
  maxSize?: number // in MB
  acceptedTypes?: string[]
  uploadedBy?: string
  taskId?: string
  submissionId?: string
}

export function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved,
  currentImage,
  disabled = false,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  uploadedBy,
  taskId,
  submissionId
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${acceptedTypes.join(', ')})`)
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload file
      const formData = new FormData()
      formData.append('image', file)
      if (uploadedBy) formData.append('uploadedBy', uploadedBy)
      if (taskId) formData.append('taskId', taskId)
      if (submissionId) formData.append('submissionId', submissionId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update preview with actual URL
      setPreview(result.imageUrl)
      onImageUploaded(result.imageUrl, result.imageId)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageRemoved?.()
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Image uploaded successfully</span>
              </div>
              <Badge variant="secondary">Ready to submit</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleClick}
        >
          <CardContent className="p-8 text-center">
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <div>
                  <p className="text-lg font-medium">Uploading image...</p>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Upload Task Image</p>
                  <p className="text-sm text-muted-foreground">
                    Click to select an image or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: {maxSize}MB • Supported: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  )
}

// Gallery component for viewing multiple images
interface ImageGalleryProps {
  images: Array<{
    id: string
    url: string
    title?: string
    description?: string
    uploadedBy?: string
    uploadedAt?: string
  }>
  onImageClick?: (image: any) => void
}

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No images found</p>
          <p className="text-sm text-muted-foreground">Upload some task images to see them here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card 
          key={image.id} 
          className="overflow-hidden hover-lift cursor-pointer"
          onClick={() => onImageClick?.(image)}
        >
          <div className="aspect-square relative">
            <img
              src={image.url}
              alt={image.title || 'Task image'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
          </div>
          <CardContent className="p-3">
            {image.title && (
              <h3 className="font-medium text-sm truncate">{image.title}</h3>
            )}
            {image.uploadedBy && (
              <p className="text-xs text-muted-foreground">By {image.uploadedBy}</p>
            )}
            {image.uploadedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(image.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
