"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import {
    Trophy, Star, Award, TreePine, Recycle, Zap, Droplets,
    Flame, Target, Medal, Crown, Gem, Heart, Sparkles
} from 'lucide-react'
import type { Badge } from '@/lib/types'

// Map icon names to components
const ICON_MAP: { [key: string]: any } = {
    Trophy, Star, Award, TreePine, Recycle, Zap, Droplets,
    Flame, Target, Medal, Crown, Gem, Heart, Sparkles
}

// Motivational messages pool
const MOTIVATIONAL_MESSAGES = [
    "You're making the planet proud! 🌍",
    "Eco-hero in the making! 🦸",
    "Keep up the amazing work! 💪",
    "The Earth thanks you! 🌱",
    "You're unstoppable! 🚀",
    "A true environmental champion! 🏆",
    "Your efforts are changing the world! ✨",
    "Nature celebrates with you! 🎉",
    "What an incredible achievement! 🌟",
    "You're an inspiration to others! 💚"
]

interface AchievementPopupProps {
    badge: Badge | null
    isOpen: boolean
    onClose: () => void
}

export function AchievementPopup({ badge, isOpen, onClose }: AchievementPopupProps) {
    const [motivationalMessage, setMotivationalMessage] = useState("")
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (isOpen && badge) {
            // Random motivational message
            const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
            setMotivationalMessage(MOTIVATIONAL_MESSAGES[randomIndex])

            // Trigger confetti
            setShowConfetti(true)

            // Stop confetti after animation
            const timer = setTimeout(() => setShowConfetti(false), 4000)
            return () => clearTimeout(timer)
        }
    }, [isOpen, badge])

    if (!badge) return null

    const IconComponent = ICON_MAP[badge.icon] || Award

    return (
        <>
            <Confetti isActive={showConfetti} />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                    >
                        {/* Background glow */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0.3] }}
                            transition={{ duration: 1.5 }}
                        >
                            <div
                                className={`w-[500px] h-[500px] rounded-full blur-[100px] ${badge.color} opacity-30`}
                            />
                        </motion.div>

                        {/* Main content */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                            className="relative z-10 text-center max-w-md"
                        >
                            {/* Achievement Header */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-6"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="inline-block"
                                >
                                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                </motion.div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    🎉 ACHIEVEMENT UNLOCKED!
                                </h1>
                                <p className="text-gray-300 text-lg">Congratulations!</p>
                            </motion.div>

                            {/* Badge Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 10,
                                    delay: 0.5
                                }}
                                className="relative mx-auto mb-6"
                            >
                                {/* Glow ring */}
                                <motion.div
                                    animate={{
                                        boxShadow: [
                                            '0 0 20px rgba(255, 215, 0, 0.5)',
                                            '0 0 60px rgba(255, 215, 0, 0.8)',
                                            '0 0 20px rgba(255, 215, 0, 0.5)'
                                        ]
                                    }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className={`w-32 h-32 mx-auto rounded-full ${badge.color} flex items-center justify-center`}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <IconComponent className="w-16 h-16 text-white drop-shadow-lg" />
                                    </motion.div>
                                </motion.div>

                                {/* Sparkle effects around badge */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${i * 60}deg) translateY(-80px)`
                                        }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            delay: i * 0.2
                                        }}
                                    >
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Badge Name & Description */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="mb-6"
                            >
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    {badge.name}
                                </h2>
                                <p className="text-gray-300 text-lg mb-4">
                                    {badge.description}
                                </p>

                                {/* Motivational message */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="text-xl text-yellow-400 font-medium"
                                >
                                    {motivationalMessage}
                                </motion.p>
                            </motion.div>

                            {/* Continue Button */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                            >
                                <Button
                                    onClick={onClose}
                                    size="lg"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Continue 🚀
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
