"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft, Trophy, Star, Award, TreePine, Recycle, Zap, Droplets,
    Flame, Target, Medal, Crown, Gem, Heart, Sparkles, Save, Eye
} from 'lucide-react'
import { saveBadge } from '@/lib/storage-api'
import { getCurrentUserFromSession } from '@/lib/storage-api'
import { AuthGuard } from '@/components/auth/auth-guard'
import { toast } from 'sonner'

// Available icons for badges
const BADGE_ICONS = [
    { name: 'Trophy', icon: Trophy },
    { name: 'Star', icon: Star },
    { name: 'Award', icon: Award },
    { name: 'TreePine', icon: TreePine },
    { name: 'Recycle', icon: Recycle },
    { name: 'Zap', icon: Zap },
    { name: 'Droplets', icon: Droplets },
    { name: 'Flame', icon: Flame },
    { name: 'Target', icon: Target },
    { name: 'Medal', icon: Medal },
    { name: 'Crown', icon: Crown },
    { name: 'Gem', icon: Gem },
    { name: 'Heart', icon: Heart },
    { name: 'Sparkles', icon: Sparkles },
]

// Available colors
const BADGE_COLORS = [
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Emerald', value: 'bg-emerald-500' },
    { name: 'Cyan', value: 'bg-cyan-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
]

// Requirement types
const REQUIREMENT_TYPES = [
    { value: 'points', label: 'Earn Points', description: 'Student must earn X eco-points' },
    { value: 'tasks', label: 'Complete Tasks', description: 'Student must complete X tasks' },
    { value: 'lessons', label: 'Complete Lessons', description: 'Student must complete X lessons' },
    { value: 'streak', label: 'Activity Streak', description: 'Student must maintain X-day streak' },
    { value: 'category_tasks', label: 'Category Tasks', description: 'Complete X tasks in specific category' },
]

const CATEGORIES = [
    { value: 'planting', label: 'Tree Planting' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'energy', label: 'Energy Conservation' },
    { value: 'water', label: 'Water Conservation' },
]

function CreateBadgePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedIcon, setSelectedIcon] = useState('Trophy')
    const [selectedColor, setSelectedColor] = useState('bg-green-500')
    const [requirementType, setRequirementType] = useState<string>('points')
    const [requirementValue, setRequirementValue] = useState(100)
    const [requirementCategory, setRequirementCategory] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Please enter a badge name')
            return
        }

        if (requirementValue <= 0) {
            toast.error('Requirement value must be greater than 0')
            return
        }

        setIsSubmitting(true)

        try {
            const user = getCurrentUserFromSession()

            await saveBadge({
                name,
                description,
                icon: selectedIcon,
                color: selectedColor,
                requirement: {
                    type: requirementType as any,
                    value: requirementValue,
                    category: requirementType === 'category_tasks' ? requirementCategory as any : undefined
                },
                createdBy: user?.id || 'system',
                schoolId: user?.school,
                isActive: true,
                createdAt: new Date().toISOString()
            })

            toast.success('Badge created successfully! 🏆')
            router.push('/teacher?tab=badges')
        } catch (error) {
            console.error('Error creating badge:', error)
            toast.error('Failed to create badge. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Get selected icon component
    const SelectedIconComponent = BADGE_ICONS.find(i => i.name === selectedIcon)?.icon || Trophy

    return (
        <AuthGuard requiredRole="teacher">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">Create New Badge</h1>
                                    <p className="text-muted-foreground">Design a custom achievement badge for students</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Badge Details</CardTitle>
                                    <CardDescription>Configure how this badge is earned and displayed</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name & Description */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Badge Name *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g., Eco Champion"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input
                                                    id="description"
                                                    placeholder="e.g., Complete 10 environmental tasks"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Icon Selection */}
                                        <div className="space-y-2">
                                            <Label>Badge Icon</Label>
                                            <div className="grid grid-cols-7 gap-2">
                                                {BADGE_ICONS.map(({ name, icon: Icon }) => (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        onClick={() => setSelectedIcon(name)}
                                                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${selectedIcon === name
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <Icon className="h-6 w-6 mx-auto" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Selection */}
                                        <div className="space-y-2">
                                            <Label>Badge Color</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {BADGE_COLORS.map(({ name, value }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setSelectedColor(value)}
                                                        className={`w-10 h-10 rounded-full ${value} transition-all hover:scale-110 ${selectedColor === value
                                                            ? 'ring-4 ring-offset-2 ring-primary'
                                                            : ''
                                                            }`}
                                                        title={name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Requirement Type */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reqType">Requirement Type</Label>
                                            <Select value={requirementType} onValueChange={setRequirementType}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select requirement type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {REQUIREMENT_TYPES.map(({ value, label, description }) => (
                                                        <SelectItem key={value} value={value}>
                                                            <div>
                                                                <span className="font-medium">{label}</span>
                                                                <span className="text-muted-foreground text-sm ml-2">- {description}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Requirement Value */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="reqValue">Requirement Value</Label>
                                                <Input
                                                    id="reqValue"
                                                    type="number"
                                                    min="1"
                                                    value={requirementValue}
                                                    onChange={(e) => setRequirementValue(parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    {requirementType === 'points' && `Student must earn ${requirementValue} eco-points`}
                                                    {requirementType === 'tasks' && `Student must complete ${requirementValue} tasks`}
                                                    {requirementType === 'lessons' && `Student must complete ${requirementValue} lessons`}
                                                    {requirementType === 'streak' && `Student must maintain ${requirementValue}-day streak`}
                                                    {requirementType === 'category_tasks' && `Student must complete ${requirementValue} ${requirementCategory || 'category'} tasks`}
                                                </p>
                                            </div>

                                            {/* Category (only for category_tasks) */}
                                            {requirementType === 'category_tasks' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select value={requirementCategory} onValueChange={setRequirementCategory}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CATEGORIES.map(({ value, label }) => (
                                                                <SelectItem key={value} value={value}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <div className="flex justify-end space-x-4 pt-4">
                                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                                <Save className="h-4 w-4 mr-2" />
                                                {isSubmitting ? 'Creating...' : 'Create Badge'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview */}
                        <div>
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Eye className="h-5 w-5 mr-2" />
                                        Preview
                                    </CardTitle>
                                    <CardDescription>How the badge will appear to students</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    {/* Badge Preview */}
                                    <div className={`w-24 h-24 rounded-full ${selectedColor} flex items-center justify-center mb-4 shadow-lg`}>
                                        <SelectedIconComponent className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-2">
                                        {name || 'Badge Name'}
                                    </h3>
                                    <p className="text-muted-foreground text-center text-sm mb-4">
                                        {description || 'Badge description will appear here'}
                                    </p>

                                    {/* Requirement Display */}
                                    <div className="w-full p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-center">
                                            <span className="font-medium">Requirement:</span>
                                            <br />
                                            {requirementType === 'points' && `Earn ${requirementValue} eco-points`}
                                            {requirementType === 'tasks' && `Complete ${requirementValue} tasks`}
                                            {requirementType === 'lessons' && `Complete ${requirementValue} lessons`}
                                            {requirementType === 'streak' && `${requirementValue}-day activity streak`}
                                            {requirementType === 'category_tasks' && `${requirementValue} ${CATEGORIES.find(c => c.value === requirementCategory)?.label || 'category'} tasks`}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default CreateBadgePage
