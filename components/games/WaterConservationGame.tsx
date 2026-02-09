"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import gsap from 'gsap'
import { Droplets, Droplet } from 'lucide-react'

interface Leak {
    id: number
    x: number
    y: number
    isFixed: boolean
}

interface WaterConservationGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

export function WaterConservationGame({ onComplete, isSubmitting }: WaterConservationGameProps) {
    const [leaks, setLeaks] = useState<Leak[]>([
        { id: 1, x: 15, y: 30, isFixed: false },
        { id: 2, x: 45, y: 20, isFixed: false },
        { id: 3, x: 75, y: 35, isFixed: false },
        { id: 4, x: 30, y: 60, isFixed: false },
        { id: 5, x: 60, y: 55, isFixed: false },
        { id: 6, x: 85, y: 70, isFixed: false },
    ])
    const [waterSaved, setWaterSaved] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const leaksFixed = leaks.filter(l => l.isFixed).length
    const totalLeaks = leaks.length
    const progress = (leaksFixed / totalLeaks) * 100

    const fixLeak = (id: number) => {
        setLeaks(prev => {
            const newLeaks = prev.map(leak =>
                leak.id === id ? { ...leak, isFixed: true } : leak
            )

            // Animate the fix
            const leakElement = document.getElementById(`leak-${id}`)
            if (leakElement) {
                gsap.to(leakElement, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'back.in',
                })
            }

            // Update water saved
            const fixed = newLeaks.filter(l => l.isFixed).length
            setWaterSaved(Math.round((fixed / totalLeaks) * 100))

            return newLeaks
        })
    }

    useEffect(() => {
        // Animate water drops for unfixed leaks
        leaks.forEach(leak => {
            if (!leak.isFixed) {
                const dropElement = document.getElementById(`drop-${leak.id}`)
                if (dropElement) {
                    gsap.to(dropElement, {
                        y: 20,
                        opacity: 0,
                        duration: 1.5,
                        repeat: -1,
                        ease: 'power1.in',
                    })
                }
            }
        })
    }, [leaks])

    useEffect(() => {
        if (leaksFixed === totalLeaks && !isSubmitting) {
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    backgroundColor: '#dcfce7',
                    duration: 1,
                    onComplete: () => {
                        onComplete(100)
                    },
                })
            }
        }
    }, [leaksFixed, totalLeaks, isSubmitting, onComplete])

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-cyan-600" />
                    Mission: Fix All Water Leaks
                </h3>
                <p className="text-sm text-muted-foreground">
                    Click on each leaking tap to fix it and stop water wastage. Fix all leaks to complete the game!
                </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Water Saved: {waterSaved}%</span>
                    <span>Leaks Fixed: {leaksFixed}/{totalLeaks}</span>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            {/* Game Area */}
            <div
                ref={containerRef}
                className="relative bg-gradient-to-b from-cyan-50 to-blue-100 rounded-2xl p-8 min-h-[400px] border-4 border-cyan-300 shadow-xl transition-colors duration-1000"
            >
                {/* Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <div className="text-9xl">🚰</div>
                </div>

                {/* Leaks */}
                <div className="relative h-full">
                    {leaks.map((leak) => (
                        <button
                            key={leak.id}
                            id={`leak-${leak.id}`}
                            onClick={() => !leak.isFixed && fixLeak(leak.id)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${leak.isFixed ? 'pointer-events-none' : 'hover:scale-110'
                                }`}
                            style={{ left: `${leak.x}%`, top: `${leak.y}%` }}
                            disabled={leak.isFixed || isSubmitting}
                        >
                            {!leak.isFixed ? (
                                <div className="relative">
                                    {/* Tap */}
                                    <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center shadow-lg">
                                        <Droplets className="h-8 w-8 text-cyan-600 animate-pulse" />
                                    </div>
                                    {/* Water drops */}
                                    <div
                                        id={`drop-${leak.id}`}
                                        className="absolute top-full left-1/2 transform -translate-x-1/2"
                                    >
                                        <Droplet className="h-6 w-6 text-cyan-400" />
                                    </div>
                                    {/* Puddle effect */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8">
                                        <div className="w-20 h-3 bg-cyan-300 rounded-full opacity-50 blur-sm" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">✓</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Completion Message */}
                {leaksFixed === totalLeaks && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/80 rounded-2xl">
                        <div className="text-center text-white">
                            <h3 className="text-3xl font-bold mb-2">Excellent! 💧</h3>
                            <p className="text-lg">All leaks fixed. Water conserved!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">💧 Water Conservation Tip:</h4>
                <p className="text-sm text-muted-foreground">
                    A single dripping tap can waste over 15 liters of water per day. Fixing leaks saves water and money!
                </p>
            </div>
        </div>
    )
}
