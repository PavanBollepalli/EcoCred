"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import { Gift, Star, Flame, Coins, Sparkles, Sun } from 'lucide-react'

interface DailyLoginRewardProps {
  isOpen: boolean
  points: number
  streak?: number
  onClose: () => void
}

const GREETINGS = [
  "Welcome back, Eco-Hero! 🌍",
  "Great to see you again! 🌱",
  "Another day, another green step! 🌿",
  "The planet is glad you're here! 🌎",
  "Ready for another eco-adventure? 🦸",
  "Your green journey continues! 🍀",
]

export function DailyLoginReward({ isOpen, points, streak = 1, onClose }: DailyLoginRewardProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
      setShowConfetti(true)
      
      // Staged animation
      const t1 = setTimeout(() => setAnimationStage(1), 300)
      const t2 = setTimeout(() => setAnimationStage(2), 800)
      const t3 = setTimeout(() => setAnimationStage(3), 1300)
      const t4 = setTimeout(() => setShowConfetti(false), 6000)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
      }
    } else {
      setAnimationStage(0)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Confetti isActive={showConfetti} />
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={onClose}
          >
            {/* Floating particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Main Card */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative bg-gradient-to-br from-amber-50 via-white to-green-50 rounded-3xl shadow-2xl 
                         max-w-md w-full mx-4 overflow-hidden border-2 border-amber-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top glow effect */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-400/20 to-transparent" />

              {/* Animated rays */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-40">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 h-20 w-1 bg-gradient-to-t from-transparent to-amber-300/40 origin-bottom"
                      style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg)` }}
                    />
                  ))}
                </motion.div>
              </div>

              <div className="relative px-8 pt-8 pb-6 text-center">
                {/* Sun icon with pulse */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="mb-4"
                >
                  <div className="relative inline-block">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                                 flex items-center justify-center shadow-lg shadow-amber-400/50"
                    >
                      <Sun className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full 
                                 flex items-center justify-center shadow-md"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Greeting text */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={animationStage >= 1 ? { opacity: 1, y: 0 } : {}}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  {greeting}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={animationStage >= 1 ? { opacity: 1 } : {}}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-500 mb-6"
                >
                  You earned your daily login reward!
                </motion.p>

                {/* Points reward card */}
                <motion.div
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={animationStage >= 2 ? { scale: 1, rotateY: 0 } : {}}
                  transition={{ type: "spring", damping: 12 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 
                             shadow-lg shadow-green-500/30 text-white"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <Coins className="h-8 w-8 text-amber-300" />
                    </motion.div>
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={animationStage >= 2 ? { scale: 1 } : {}}
                      transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
                      className="text-5xl font-extrabold"
                    >
                      +{points}
                    </motion.span>
                  </div>
                  <p className="text-green-100 font-medium text-lg">Eco-Points Earned!</p>
                </motion.div>

                {/* Streak info */}
                {streak > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={animationStage >= 3 ? { opacity: 1, y: 0 } : {}}
                    className="flex items-center justify-center gap-4 mb-6"
                  >
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <div className="text-left">
                        <div className="text-lg font-bold text-orange-600">{streak} Day Streak</div>
                        <div className="text-xs text-orange-400">Keep it going!</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2">
                      <Star className="h-5 w-5 text-purple-500" />
                      <div className="text-left">
                        <div className="text-xs text-purple-400">Daily Bonus</div>
                        <div className="text-sm font-bold text-purple-600">Login every day!</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tips */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={animationStage >= 3 ? { opacity: 1 } : {}}
                  className="text-xs text-gray-400 mb-4"
                >
                  💡 Log in daily to maintain your streak and earn bonus points!
                </motion.p>

                {/* Claim button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animationStage >= 3 ? { opacity: 1, y: 0 } : {}}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 
                               hover:to-emerald-700 text-white font-bold text-lg py-6 rounded-xl 
                               shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02]"
                  >
                    <Gift className="h-5 w-5 mr-2" />
                    Awesome! Let&apos;s Go!
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
