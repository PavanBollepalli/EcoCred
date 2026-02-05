"use client"

import { useEffect, useRef, useCallback } from 'react'

interface ConfettiProps {
    isActive: boolean
    duration?: number
    colors?: string[]
}

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    rotation: number
    rotationSpeed: number
    opacity: number
}

export function Confetti({
    isActive,
    duration = 4000,
    colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#FF69B4']
}: ConfettiProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const animationRef = useRef<number>()
    const startTimeRef = useRef<number>(0)

    const createParticles = useCallback(() => {
        const particles: Particle[] = []
        const particleCount = 150

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            })
        }

        return particles
    }, [colors])

    const animate = useCallback((timestamp: number) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const elapsed = timestamp - startTimeRef.current

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Update and draw particles
        particlesRef.current.forEach((particle) => {
            // Update position
            particle.x += particle.vx
            particle.vy += 0.1 // gravity
            particle.y += particle.vy
            particle.rotation += particle.rotationSpeed

            // Fade out towards end
            if (elapsed > duration * 0.7) {
                particle.opacity = Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3))
            }

            // Draw particle
            ctx.save()
            ctx.translate(particle.x, particle.y)
            ctx.rotate((particle.rotation * Math.PI) / 180)
            ctx.globalAlpha = particle.opacity
            ctx.fillStyle = particle.color

            // Draw confetti shape (rectangle)
            ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2)

            ctx.restore()
        })

        // Continue animation
        if (elapsed < duration) {
            animationRef.current = requestAnimationFrame(animate)
        }
    }, [duration])

    useEffect(() => {
        if (!isActive) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Set canvas size
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Create particles
        particlesRef.current = createParticles()
        startTimeRef.current = performance.now()

        // Start animation
        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [isActive, createParticles, animate])

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current
            if (canvas) {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!isActive) return null

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ width: '100vw', height: '100vh' }}
        />
    )
}
