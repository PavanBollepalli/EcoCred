"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Badge, User, Submission } from '@/lib/types'

interface BadgeProgress {
    badge: Badge
    current: number
    required: number
    isEarned: boolean
}

interface UseBadgeCheckerOptions {
    user: User | null
    submissions: Submission[]
    onBadgeEarned?: (badge: Badge) => void
}

// Fetch all badges from API
async function fetchBadges(): Promise<Badge[]> {
    try {
        const response = await fetch('/api/badges')
        if (!response.ok) throw new Error('Failed to fetch badges')
        return await response.json()
    } catch (error) {
        console.error('Error fetching badges:', error)
        return []
    }
}

// Calculate progress for a single badge
function calculateBadgeProgress(
    badge: Badge,
    user: User,
    submissions: Submission[]
): BadgeProgress {
    const { requirement } = badge
    let current = 0

    switch (requirement.type) {
        case 'points':
            current = user.ecoPoints || 0
            break

        case 'tasks':
            // Count approved submissions
            current = submissions.filter(s => s.status === 'approved').length
            break

        case 'lessons':
            // Count completed lessons
            current = user.completedLessons?.length || 0
            break

        case 'streak':
            current = user.streak || 0
            break

        case 'category_tasks':
            // Count approved submissions in specific category
            if (requirement.category) {
                // We need task info to filter by category
                // For now, count all approved as a fallback
                current = submissions.filter(s => s.status === 'approved').length
            }
            break
    }

    return {
        badge,
        current,
        required: requirement.value,
        isEarned: current >= requirement.value
    }
}

export function useBadgeChecker({ user, submissions, onBadgeEarned }: UseBadgeCheckerOptions) {
    const [badges, setBadges] = useState<Badge[]>([])
    const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([])
    const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null)
    const [checkedBadges, setCheckedBadges] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    // Load badges on mount
    useEffect(() => {
        async function loadBadges() {
            setLoading(true)
            const allBadges = await fetchBadges()
            setBadges(allBadges)
            setLoading(false)
        }
        loadBadges()
    }, [])

    // Check for newly earned badges
    const checkBadges = useCallback(() => {
        if (!user || badges.length === 0) return

        const userBadges = new Set(user.badges || [])
        const progress: BadgeProgress[] = []

        for (const badge of badges) {
            const bp = calculateBadgeProgress(badge, user, submissions)
            progress.push(bp)

            // Check if this is a newly earned badge
            if (bp.isEarned && !userBadges.has(badge.id) && !checkedBadges.has(badge.id)) {
                // Mark as checked to prevent double-triggering
                setCheckedBadges(prev => new Set([...prev, badge.id]))

                // Trigger celebration
                setNewlyEarnedBadge(badge)
                onBadgeEarned?.(badge)
                break // Only show one badge at a time
            }
        }

        setBadgeProgress(progress)
    }, [user, badges, submissions, checkedBadges, onBadgeEarned])

    // Run check when dependencies change
    useEffect(() => {
        checkBadges()
    }, [checkBadges])

    // Clear newly earned badge (call after closing popup)
    const clearNewlyEarnedBadge = useCallback(() => {
        setNewlyEarnedBadge(null)
    }, [])

    return {
        badges,
        badgeProgress,
        newlyEarnedBadge,
        clearNewlyEarnedBadge,
        loading,
        checkBadges
    }
}
