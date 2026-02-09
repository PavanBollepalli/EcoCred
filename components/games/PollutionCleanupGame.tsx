"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Leaf, Trash } from 'lucide-react'

interface PollutionItem {
    id: number
    x: number
    y: number
    type: 'plastic' | 'trash' | 'can' | 'bottle'
    emoji: string
    collected: boolean
}

interface PollutionCleanupGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

export function PollutionCleanupGame({ onComplete, isSubmitting }: PollutionCleanupGameProps) {
    const [pollutionItems, setPollutionItems] = useState<PollutionItem[]>([
        { id: 1, x: 10, y: 20, type: 'plastic', emoji: '🛍️', collected: false },
        { id: 2, x: 25, y: 40, type: 'bottle', emoji: '🍾', collected: false },
        { id: 3, x: 40, y: 15, type: 'can', emoji: '🥫', collected: false },
        { id: 4, x: 55, y: 35, type: 'trash', emoji: '🗑️', collected: false },
        { id: 5, x: 70, y: 25, type: 'plastic', emoji: '🛍️', collected: false },
        { id: 6, x: 85, y: 45, type: 'bottle', emoji: '🍾', collected: false },
        { id: 7, x: 15, y: 60, type: 'can', emoji: '🥫', collected: false },
        { id: 8, x: 30, y: 75, type: 'trash', emoji: '🗑️', collected: false },
        { id: 9, x: 50, y: 65, type: 'plastic', emoji: '🛍️', collected: false },
        { id: 10, x: 65, y: 80, type: 'bottle', emoji: '🍾', collected: false },
        { id: 11, x: 80, y: 70, type: 'can', emoji: '🥫', collected: false },
        { id: 12, x: 45, y: 90, type: 'trash', emoji: '🗑️', collected: false },
    ])

    const itemsCollected = pollutionItems.filter(item => item.collected).length
    const totalItems = pollutionItems.length
    const progress = (itemsCollected / totalItems) * 100

    const collectItem = (id: number) => {
        setPollutionItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, collected: true } : item
            )
        )
    }

    useEffect(() => {
        if (itemsCollected === totalItems && !isSubmitting) {
            setTimeout(() => onComplete(100), 500)
        }
    }, [itemsCollected, totalItems, isSubmitting, onComplete])

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                    Mission: Clean Up All Pollution
                </h3>
                <p className="text-sm text-muted-foreground">
                    Click on each piece of pollution to collect it and clean the environment. Collect all items to complete!
                </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Cleanup Progress: {progress.toFixed(0)}%</span>
                    <span>Items Collected: {itemsCollected}/{totalItems}</span>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            {/* Game Area */}
            <div
                className="relative rounded-2xl p-8 min-h-[500px] border-4 shadow-xl transition-all duration-1000"
                style={{
                    background: progress === 100
                        ? 'linear-gradient(to bottom, #d1fae5, #a7f3d0)'
                        : 'linear-gradient(to bottom, #fef3c7, #fde68a)',
                    borderColor: progress === 100 ? '#10b981' : '#f59e0b',
                }}
            >
                {/* Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="text-9xl">{progress === 100 ? '🌳' : '🏭'}</div>
                </div>

                {/* Pollution Items */}
                <div className="relative h-full">
                    {pollutionItems.map((item) => (
                        !item.collected && (
                            <button
                                key={item.id}
                                onClick={() => collectItem(item.id)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer"
                                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                                disabled={isSubmitting}
                            >
                                <div className="text-4xl animate-bounce">{item.emoji}</div>
                            </button>
                        )
                    ))}
                </div>

                {/* Completion Message */}
                {progress === 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/80 rounded-2xl">
                        <div className="text-center text-white">
                            <h3 className="text-3xl font-bold mb-2">Amazing! 🌍</h3>
                            <p className="text-lg">Environment cleaned successfully!</p>
                        </div>
                    </div>
                )}

                {/* Clean Environment Indicator */}
                {progress === 100 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 text-4xl">
                        <span>🌳</span>
                        <span>🌸</span>
                        <span>🦋</span>
                        <span>🌺</span>
                        <span>🌳</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-3xl mb-2">♻️</div>
                    <div className="text-sm text-muted-foreground">Recyclables Collected</div>
                    <div className="text-2xl font-bold text-green-600">
                        {pollutionItems.filter(i => i.collected && (i.type === 'plastic' || i.type === 'bottle' || i.type === 'can')).length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-3xl mb-2">🗑️</div>
                    <div className="text-sm text-muted-foreground">Trash Removed</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {pollutionItems.filter(i => i.collected && i.type === 'trash').length}
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">🌍 Environmental Tip:</h4>
                <p className="text-sm text-muted-foreground">
                    Cleaning up pollution prevents harm to wildlife and ecosystems. Every piece of litter removed makes a difference!
                </p>
            </div>
        </div>
    )
}
