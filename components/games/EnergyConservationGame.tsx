"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import gsap from 'gsap'
import { Lightbulb, LightbulbOff, Zap } from 'lucide-react'

interface Light {
    id: number
    isOn: boolean
    x: number
    y: number
}

interface EnergyConservationGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

export function EnergyConservationGame({ onComplete, isSubmitting }: EnergyConservationGameProps) {
    const [lights, setLights] = useState<Light[]>([
        { id: 1, isOn: true, x: 20, y: 20 },
        { id: 2, isOn: true, x: 50, y: 20 },
        { id: 3, isOn: true, x: 80, y: 20 },
        { id: 4, isOn: true, x: 20, y: 50 },
        { id: 5, isOn: true, x: 50, y: 50 },
        { id: 6, isOn: true, x: 80, y: 50 },
        { id: 7, isOn: true, x: 35, y: 80 },
        { id: 8, isOn: true, x: 65, y: 80 },
    ])
    const [energySaved, setEnergySaved] = useState(0)
    const houseRef = useRef<HTMLDivElement>(null)

    const lightsOn = lights.filter(l => l.isOn).length
    const totalLights = lights.length
    const progress = ((totalLights - lightsOn) / totalLights) * 100

    const toggleLight = (id: number) => {
        setLights(prev => {
            const newLights = prev.map(light =>
                light.id === id ? { ...light, isOn: !light.isOn } : light
            )

            // Animate the light toggle
            const lightElement = document.getElementById(`light-${id}`)
            if (lightElement) {
                gsap.to(lightElement, {
                    scale: 1.2,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                })
            }

            // Update energy saved
            const lightsOff = newLights.filter(l => !l.isOn).length
            setEnergySaved(lightsOff * 12.5) // Each light saves 12.5% energy

            return newLights
        })
    }

    useEffect(() => {
        // Check if all lights are off
        if (lightsOn === 0 && !isSubmitting) {
            // Celebrate!
            if (houseRef.current) {
                gsap.to(houseRef.current, {
                    scale: 1.05,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        onComplete(100)
                    },
                })
            }
        }
    }, [lightsOn, isSubmitting, onComplete])

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Mission: Turn Off All Lights
                </h3>
                <p className="text-sm text-muted-foreground">
                    Click on each light bulb to turn it off and save energy. Turn off all lights to complete the game!
                </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Energy Saved: {energySaved.toFixed(0)}%</span>
                    <span>Lights Off: {totalLights - lightsOn}/{totalLights}</span>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            {/* House with Lights */}
            <div
                ref={houseRef}
                className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl p-8 min-h-[400px] border-4 border-slate-300 shadow-xl"
                style={{
                    background: lightsOn === 0
                        ? 'linear-gradient(to bottom, #1e293b, #334155)'
                        : 'linear-gradient(to bottom, #fef3c7, #fde68a)',
                }}
            >
                {/* House Structure */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="text-9xl">🏠</div>
                </div>

                {/* Lights Grid */}
                <div className="relative grid grid-cols-3 gap-8 p-8">
                    {lights.map((light) => (
                        <button
                            key={light.id}
                            id={`light-${light.id}`}
                            onClick={() => toggleLight(light.id)}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${light.isOn
                                    ? 'bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-pulse'
                                    : 'bg-gray-600 shadow-md'
                                }`}
                            disabled={isSubmitting}
                        >
                            {light.isOn ? (
                                <Lightbulb className="h-10 w-10 text-yellow-900" />
                            ) : (
                                <LightbulbOff className="h-10 w-10 text-gray-300" />
                            )}

                            {/* Glow effect when on */}
                            {light.isOn && (
                                <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-50 blur-xl animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Completion Message */}
                {lightsOn === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/80 rounded-2xl">
                        <div className="text-center text-white">
                            <h3 className="text-3xl font-bold mb-2">Perfect! 🌟</h3>
                            <p className="text-lg">All lights are off. Energy saved!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">💡 Energy Saving Tip:</h4>
                <p className="text-sm text-muted-foreground">
                    Turning off lights when not in use can save up to 10% on your electricity bill and reduce carbon emissions!
                </p>
            </div>
        </div>
    )
}
