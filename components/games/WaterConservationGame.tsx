"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Droplets, Droplet, Timer, Star, Zap, CheckCircle2, XCircle, Info, ShieldCheck } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ScenarioType = 'leaking-tap' | 'running-shower' | 'broken-pipe' | 'garden-hose' | 'overflowing-tank' | 'dripping-faucet'

interface WaterSource {
    id: number
    x: number
    y: number
    type: ScenarioType
    emoji: string
    label: string
    waterLossRate: number // liters per second (visual)
    isFixed: boolean
    fixMethod: string
    fact: string
}

interface QuizQuestion {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
}

interface WaterConservationGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

// ─── Level configs ──────────────────────────────────────────────────────────

const LEVEL_CONFIGS = [
    {
        name: 'Kitchen & Bathroom',
        scene: '🏠',
        bgFrom: '#e0f2fe',
        bgTo: '#bae6fd',
        timeLimit: 45,
        sources: [
            { type: 'leaking-tap' as ScenarioType, emoji: '🚰', label: 'Leaking Kitchen Tap', waterLossRate: 2, fixMethod: 'Replace the worn washer', fact: 'A dripping faucet can waste over 11,000 liters of water a year.' },
            { type: 'running-shower' as ScenarioType, emoji: '🚿', label: 'Running Shower', waterLossRate: 8, fixMethod: 'Turn off while soaping', fact: 'A 5-minute shower uses about 40 liters of water. Turning off while soaping saves 50%!' },
            { type: 'dripping-faucet' as ScenarioType, emoji: '💧', label: 'Dripping Bathroom Faucet', waterLossRate: 1, fixMethod: 'Tighten the faucet handle', fact: 'Even a slow drip wastes 20 liters per day — that\'s 7,300 liters a year.' },
            { type: 'overflowing-tank' as ScenarioType, emoji: '🪣', label: 'Overflowing Water Tank', waterLossRate: 10, fixMethod: 'Install a float valve', fact: 'Overflowing tanks waste thousands of liters monthly. Float valves cost less than $5 to install.' },
        ],
        quiz: {
            question: 'How much water does a typical household waste through leaks each year?',
            options: ['1,000 liters', '11,000 liters', '100 liters', '50,000 liters'],
            correctIndex: 1,
            explanation: 'A typical household loses about 11,000 liters per year from leaks — enough to fill a swimming pool!',
        } as QuizQuestion,
    },
    {
        name: 'Garden & Outdoors',
        scene: '🌳',
        bgFrom: '#dcfce7',
        bgTo: '#bbf7d0',
        timeLimit: 40,
        sources: [
            { type: 'garden-hose' as ScenarioType, emoji: '🌱', label: 'Unattended Garden Hose', waterLossRate: 12, fixMethod: 'Use drip irrigation instead', fact: 'A garden hose uses 30 liters per minute. Drip irrigation uses 70% less water.' },
            { type: 'broken-pipe' as ScenarioType, emoji: '🔧', label: 'Broken Sprinkler Pipe', waterLossRate: 15, fixMethod: 'Repair the cracked pipe joint', fact: 'One broken sprinkler head can waste over 90 liters per hour.' },
            { type: 'leaking-tap' as ScenarioType, emoji: '🚰', label: 'Outdoor Tap Left On', waterLossRate: 6, fixMethod: 'Install a self-closing tap', fact: 'Self-closing taps can reduce outdoor water use by 50%.' },
            { type: 'running-shower' as ScenarioType, emoji: '🚗', label: 'Car Wash with Hose', waterLossRate: 20, fixMethod: 'Use a bucket instead of hose', fact: 'Washing a car with a bucket uses 30 liters vs 150 liters with a hose.' },
            { type: 'overflowing-tank' as ScenarioType, emoji: '🏊', label: 'Overflowing Pool', waterLossRate: 25, fixMethod: 'Install water level sensor', fact: 'Pool evaporation alone loses 3,500 liters per month. A cover reduces this by 95%.' },
        ],
        quiz: {
            question: 'What is the most water-efficient way to water a garden?',
            options: ['Sprinkler system', 'Garden hose', 'Drip irrigation', 'Flooding the beds'],
            correctIndex: 2,
            explanation: 'Drip irrigation delivers water directly to plant roots, using 30-50% less water than sprinklers.',
        } as QuizQuestion,
    },
    {
        name: 'Community Water Rescue',
        scene: '🏘️',
        bgFrom: '#dbeafe',
        bgTo: '#93c5fd',
        timeLimit: 35,
        sources: [
            { type: 'broken-pipe' as ScenarioType, emoji: '🚧', label: 'Burst Main Pipe', waterLossRate: 50, fixMethod: 'Emergency pipe clamp', fact: 'Up to 30% of treated water is lost through pipe leaks before reaching homes.' },
            { type: 'leaking-tap' as ScenarioType, emoji: '⛲', label: 'Leaking Public Fountain', waterLossRate: 5, fixMethod: 'Report to municipality', fact: 'Public water features should recirculate water. Report leaks to save community water.' },
            { type: 'overflowing-tank' as ScenarioType, emoji: '🏫', label: 'School Tank Overflow', waterLossRate: 8, fixMethod: 'Install automatic shutoff', fact: 'Schools can save 30% water by installing automatic shutoff valves and fixing leaks promptly.' },
            { type: 'garden-hose' as ScenarioType, emoji: '🌾', label: 'Open Field Flooding', waterLossRate: 30, fixMethod: 'Switch to canal irrigation', fact: 'Flood irrigation loses 50% to evaporation. Modern methods save billions of liters annually.' },
            { type: 'dripping-faucet' as ScenarioType, emoji: '🏥', label: 'Hospital Faucet Leak', waterLossRate: 3, fixMethod: 'Install motion sensors', fact: 'Motion-sensor faucets in public buildings reduce water use by 70%.' },
            { type: 'running-shower' as ScenarioType, emoji: '🏭', label: 'Factory Coolant Leak', waterLossRate: 40, fixMethod: 'Install closed-loop cooling', fact: 'Closed-loop cooling systems can recycle 98% of industrial water.' },
        ],
        quiz: {
            question: 'What percentage of Earth\'s water is fresh and available for human use?',
            options: ['25%', '10%', 'Less than 1%', '50%'],
            correctIndex: 2,
            explanation: 'Less than 1% of all water on Earth is fresh and accessible. This makes conservation critical!',
        } as QuizQuestion,
    },
]

function generatePositions(count: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []
    const minDist = 16
    for (let i = 0; i < count; i++) {
        let tries = 0
        let pos = { x: 10 + Math.random() * 78, y: 10 + Math.random() * 68 }
        while (tries < 60) {
            const ok = positions.every((p) => Math.hypot(p.x - pos.x, p.y - pos.y) > minDist)
            if (ok) break
            pos = { x: 10 + Math.random() * 78, y: 10 + Math.random() * 68 }
            tries++
        }
        positions.push(pos)
    }
    return positions
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WaterConservationGame({ onComplete, isSubmitting }: WaterConservationGameProps) {
    const [level, setLevel] = useState(0)
    const [sources, setSources] = useState<WaterSource[]>([])
    const [score, setScore] = useState(0)
    const [waterWasted, setWaterWasted] = useState(0)
    const [waterSaved, setWaterSaved] = useState(0)
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIGS[0].timeLimit)
    const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'quiz' | 'quiz-result' | 'level-complete' | 'finished'>('intro')
    const [showFact, setShowFact] = useState<{ fact: string; method: string } | null>(null)
    const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null)
    const [quizCorrect, setQuizCorrect] = useState(false)
    const [fixAnimation, setFixAnimation] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const waterRef = useRef<NodeJS.Timeout | null>(null)

    const config = LEVEL_CONFIGS[level]

    // Init level
    const initLevel = useCallback((lvl: number) => {
        const cfg = LEVEL_CONFIGS[lvl]
        const positions = generatePositions(cfg.sources.length)
        const newSources: WaterSource[] = cfg.sources.map((s, i) => ({
            id: i,
            x: positions[i].x,
            y: positions[i].y,
            ...s,
            isFixed: false,
        }))
        setSources(newSources)
        setTimeLeft(cfg.timeLimit)
        setShowFact(null)
        setSelectedQuizAnswer(null)
        setFixAnimation(null)
    }, [])

    const startGame = () => {
        setGamePhase('playing')
        setScore(0)
        setWaterWasted(0)
        setWaterSaved(0)
        setLevel(0)
        initLevel(0)
    }

    // Timer
    useEffect(() => {
        if (gamePhase !== 'playing') return
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [gamePhase, level])

    // Water waste accumulator - unfixed sources waste water over time
    useEffect(() => {
        if (gamePhase !== 'playing') return
        waterRef.current = setInterval(() => {
            setSources((currentSources) => {
                const activeRate = currentSources
                    .filter((s) => !s.isFixed)
                    .reduce((sum, s) => sum + s.waterLossRate, 0)
                if (activeRate > 0) {
                    setWaterWasted((prev) => prev + activeRate)
                }
                return currentSources
            })
        }, 1000)
        return () => { if (waterRef.current) clearInterval(waterRef.current) }
    }, [gamePhase, level])

    // Check level completion
    useEffect(() => {
        if (gamePhase !== 'playing') return
        const allFixed = sources.length > 0 && sources.every((s) => s.isFixed)
        if (allFixed || timeLeft === 0) {
            if (timerRef.current) clearInterval(timerRef.current)
            if (waterRef.current) clearInterval(waterRef.current)
            // Go to quiz before level complete
            setTimeout(() => setGamePhase('quiz'), 600)
        }
    }, [sources, timeLeft, gamePhase])

    // Fix a water source
    const fixSource = (id: number) => {
        if (gamePhase !== 'playing') return
        const source = sources.find((s) => s.id === id)
        if (!source || source.isFixed) return

        setFixAnimation(id)
        setTimeout(() => setFixAnimation(null), 600)

        const remainingTime = timeLeft
        const speedBonus = Math.round(remainingTime * 0.5)
        const pointsEarned = 15 + speedBonus

        setScore((prev) => prev + pointsEarned)
        setWaterSaved((prev) => prev + source.waterLossRate * 60) // estimated liters saved per minute
        setSources((prev) => prev.map((s) => s.id === id ? { ...s, isFixed: true } : s))
        setShowFact({ fact: source.fact, method: source.fixMethod })
    }

    // Quiz answer
    const answerQuiz = (index: number) => {
        setSelectedQuizAnswer(index)
        const correct = index === config.quiz.correctIndex
        setQuizCorrect(correct)
        if (correct) {
            setScore((prev) => prev + 25)
        }
        setGamePhase('quiz-result')
    }

    // Move from quiz result to next
    const proceedFromQuiz = () => {
        if (level < LEVEL_CONFIGS.length - 1) {
            setGamePhase('level-complete')
        } else {
            setGamePhase('finished')
        }
    }

    const nextLevel = () => {
        const next = level + 1
        setLevel(next)
        initLevel(next)
        setGamePhase('playing')
    }

    // Handle game finish
    useEffect(() => {
        if (gamePhase === 'finished' && !isSubmitting) {
            const finalScore = Math.min(Math.round((score / (LEVEL_CONFIGS.length * 150)) * 100), 100)
            setTimeout(() => onComplete(Math.max(finalScore, 60)), 1500)
        }
    }, [gamePhase, isSubmitting, score, onComplete])

    const leaksFixed = sources.filter((s) => s.isFixed).length
    const totalLeaks = sources.length
    const progress = totalLeaks > 0 ? (leaksFixed / totalLeaks) * 100 : 0
    const totalWaterLossRate = sources.filter((s) => !s.isFixed).reduce((sum, s) => sum + s.waterLossRate, 0)

    // ─── INTRO ──────────────────────────────────────────────────────────
    if (gamePhase === 'intro') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-300 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">💧</div>
                    <h2 className="text-3xl font-bold text-cyan-800 mb-3">Water Conservation Challenge</h2>
                    <p className="text-cyan-700 max-w-lg mx-auto mb-6">
                        Find and fix water leaks across 3 different scenarios! Every second counts — unfixed leaks waste water in real-time.
                        Answer quiz questions between levels to earn bonus points.
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                        {LEVEL_CONFIGS.map((cfg, i) => (
                            <div key={i} className="p-3 rounded-xl bg-white/70 border border-cyan-200">
                                <div className="text-2xl mb-1">{cfg.scene}</div>
                                <div className="text-xs font-semibold text-cyan-700">Level {i + 1}</div>
                                <div className="text-[10px] text-muted-foreground">{cfg.name}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto mb-6 text-left">
                        <h4 className="font-semibold text-sm text-blue-800 mb-2">How to Play:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Click on leaking water sources to fix them</li>
                            <li>• Fix leaks quickly — water waste accumulates every second!</li>
                            <li>• Learn the fix method and environmental fact for each leak</li>
                            <li>• Answer the quiz after each level for bonus points</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-3">
                        <Droplets className="h-5 w-5 mr-2" />
                        Start Saving Water!
                    </Button>
                </div>
            </div>
        )
    }

    // ─── QUIZ ───────────────────────────────────────────────────────────
    if (gamePhase === 'quiz') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-300 rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-3">🧠</div>
                        <h2 className="text-2xl font-bold text-indigo-800">Water Knowledge Quiz</h2>
                        <p className="text-sm text-indigo-600 mt-1">Answer correctly for +25 bonus points!</p>
                    </div>

                    <div className="bg-white/80 rounded-xl p-6 max-w-lg mx-auto">
                        <p className="font-semibold text-lg text-center mb-6">{config.quiz.question}</p>
                        <div className="space-y-3">
                            {config.quiz.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => answerQuiz(i)}
                                    className="w-full text-left p-4 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium"
                                >
                                    <span className="inline-block w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-center text-sm leading-7 mr-3 font-bold">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── QUIZ RESULT ────────────────────────────────────────────────────
    if (gamePhase === 'quiz-result') {
        return (
            <div className="space-y-6">
                <div className={`border-2 rounded-2xl p-8 text-center ${quizCorrect
                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300'
                    : 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300'
                    }`}>
                    <div className="text-5xl mb-3">{quizCorrect ? '✅' : '📘'}</div>
                    <h2 className={`text-2xl font-bold mb-2 ${quizCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                        {quizCorrect ? 'Correct! +25 Points' : 'Not quite!'}
                    </h2>
                    <div className="bg-white/80 rounded-xl p-5 max-w-lg mx-auto mb-6">
                        <p className="text-sm font-semibold mb-2">Correct answer: {config.quiz.options[config.quiz.correctIndex]}</p>
                        <p className="text-sm text-muted-foreground">{config.quiz.explanation}</p>
                    </div>
                    <Button size="lg" onClick={proceedFromQuiz} className={quizCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}>
                        Continue
                    </Button>
                </div>
            </div>
        )
    }

    // ─── LEVEL COMPLETE ─────────────────────────────────────────────────
    if (gamePhase === 'level-complete') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-300 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-cyan-800 mb-2">Level {level + 1} Complete!</h2>
                    <p className="text-cyan-700 mb-2">{config.name} — all leaks fixed!</p>
                    <div className="text-2xl font-bold text-cyan-800 mb-4">Score: {score} pts</div>

                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                        <div className="bg-white/80 p-3 rounded-xl">
                            <div className="text-xl font-bold text-green-600">{Math.round(waterSaved)} L</div>
                            <div className="text-xs text-muted-foreground">Water Saved</div>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl">
                            <div className="text-xl font-bold text-red-500">{Math.round(waterWasted)} L</div>
                            <div className="text-xs text-muted-foreground">Water Wasted</div>
                        </div>
                    </div>

                    <p className="text-sm text-cyan-700 mb-4">
                        Next: <strong>{LEVEL_CONFIGS[level + 1].name}</strong> — {LEVEL_CONFIGS[level + 1].sources.length} sources, {LEVEL_CONFIGS[level + 1].timeLimit}s
                    </p>
                    <Button size="lg" onClick={nextLevel} className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8">
                        <Zap className="h-5 w-5 mr-2" />
                        Next Level
                    </Button>
                </div>
            </div>
        )
    }

    // ─── FINISHED ───────────────────────────────────────────────────────
    if (gamePhase === 'finished') {
        const efficiency = waterSaved + waterWasted > 0
            ? Math.round((waterSaved / (waterSaved + waterWasted)) * 100)
            : 0
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-200 border-2 border-blue-400 rounded-2xl p-8 text-center">
                    <div className="text-7xl mb-4">🏆</div>
                    <h2 className="text-3xl font-bold text-blue-800 mb-3">Water Hero!</h2>
                    <p className="text-blue-700 mb-6">You've completed all 3 water conservation scenarios!</p>

                    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-cyan-600">{score}</div>
                            <div className="text-xs text-muted-foreground">Total Points</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-green-600">{Math.round(waterSaved)} L</div>
                            <div className="text-xs text-muted-foreground">Water Saved</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600">{efficiency}%</div>
                            <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                    </div>

                    <p className="text-sm text-blue-600 italic">
                        &quot;Thousands have lived without love, not one without water.&quot; — W.H. Auden
                    </p>
                </div>
            </div>
        )
    }

    // ─── PLAYING ────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
                        {config.scene} Level {level + 1}: {config.name}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                        <Star className="h-3 w-3 mr-1" /> {score} pts
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    {/* Active water loss indicator */}
                    <Badge variant="destructive" className={`px-3 py-1 ${totalWaterLossRate > 0 ? 'animate-pulse' : ''}`}>
                        <Droplet className="h-3 w-3 mr-1" />
                        {totalWaterLossRate > 0 ? `-${totalWaterLossRate} L/s` : 'No leaks!'}
                    </Badge>
                    <div className="flex items-center gap-1">
                        <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Leaks Fixed: {leaksFixed}/{totalLeaks}</span>
                    <span>Water Wasted: {Math.round(waterWasted)} L</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Water Meter */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-3 border">
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-red-500 font-semibold">💧 Waste:</span>
                    <span className="font-mono font-bold text-red-600">{Math.round(waterWasted)} L</span>
                </div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-green-600 font-semibold">💚 Saved:</span>
                    <span className="font-mono font-bold text-green-600">{Math.round(waterSaved)} L</span>
                </div>
            </div>

            {/* Fact popup */}
            {showFact && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800"><strong>Fix:</strong> {showFact.method}</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{showFact.fact}</p>
                    </div>
                </div>
            )}

            {/* Game Area */}
            <div
                className="relative rounded-2xl p-4 min-h-[400px] border-4 shadow-xl transition-all duration-700 overflow-hidden"
                style={{
                    background: `linear-gradient(to bottom, ${config.bgFrom}, ${config.bgTo})`,
                    borderColor: progress === 100 ? '#10b981' : '#06b6d4',
                }}
            >
                {/* Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
                    <div className="text-[10rem] select-none">{config.scene}</div>
                </div>

                {/* Water sources */}
                {sources.map((source) => (
                    <button
                        key={source.id}
                        onClick={() => !source.isFixed && fixSource(source.id)}
                        disabled={source.isFixed || isSubmitting}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group
                            ${source.isFixed
                                ? 'pointer-events-none'
                                : 'hover:scale-110 cursor-pointer'
                            }
                            ${fixAnimation === source.id ? 'scale-125' : ''}
                        `}
                        style={{ left: `${source.x}%`, top: `${source.y}%` }}
                        title={source.label}
                    >
                        {!source.isFixed ? (
                            <div className="relative">
                                {/* Source icon */}
                                <div className="w-16 h-16 bg-white/90 rounded-xl flex items-center justify-center shadow-lg border-2 border-cyan-300 hover:border-cyan-500 transition-colors">
                                    <span className="text-3xl">{source.emoji}</span>
                                </div>
                                {/* Water drops animation */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {Array.from({ length: Math.min(Math.ceil(source.waterLossRate / 5), 4) }).map((_, i) => (
                                        <Droplet
                                            key={i}
                                            className="h-4 w-4 text-cyan-400 animate-bounce"
                                            style={{ animationDelay: `${i * 200}ms`, animationDuration: '0.8s' }}
                                        />
                                    ))}
                                </div>
                                {/* Label */}
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-white/95 rounded px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow border">
                                    {source.label} ({source.waterLossRate} L/s)
                                </span>
                                {/* Loss rate badge */}
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {source.waterLossRate}
                                </span>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center shadow-md border-2 border-green-400">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        )}
                    </button>
                ))}

                {/* All fixed overlay */}
                {progress === 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/70 rounded-2xl animate-in fade-in duration-500">
                        <div className="text-center text-white">
                            <h3 className="text-3xl font-bold mb-2">All Leaks Fixed! 💧</h3>
                            <p className="text-lg">Preparing quiz...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">🔧</div>
                    <div className="text-lg font-bold text-green-600">{leaksFixed}</div>
                    <div className="text-[10px] text-muted-foreground">Leaks Fixed</div>
                </Card>
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">💧</div>
                    <div className="text-lg font-bold text-red-500">{Math.round(waterWasted)} L</div>
                    <div className="text-[10px] text-muted-foreground">Water Wasted</div>
                </Card>
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">💚</div>
                    <div className="text-lg font-bold text-cyan-600">{Math.round(waterSaved)} L</div>
                    <div className="text-[10px] text-muted-foreground">Water Saved</div>
                </Card>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-600" /> Water Conservation Tip
                </h4>
                <p className="text-xs text-muted-foreground">
                    {level === 0 && "Fix the biggest leaks first! The red number on each source shows its waste rate in liters per second."}
                    {level === 1 && "Outdoor water use accounts for 30% of household water. Smart irrigation can cut this in half."}
                    {level === 2 && "Community water infrastructure loses billions of liters annually. Reporting leaks makes a real difference!"}
                </p>
            </div>
        </div>
    )
}
