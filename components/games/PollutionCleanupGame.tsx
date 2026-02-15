"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Leaf, TreePine, Timer, Zap, Star, AlertTriangle, CheckCircle2, Info, ArrowDown } from 'lucide-react'

// ─── Pollution items with categories & educational facts ────────────────────
type WasteCategory = 'recyclable' | 'organic' | 'hazardous'

interface PollutionItem {
    id: number
    x: number
    y: number
    type: string
    emoji: string
    label: string
    category: WasteCategory
    fact: string
    collected: boolean
    sorted: boolean
    animating: boolean
}

interface PollutionCleanupGameProps {
    onComplete: (score: number) => void
    isSubmitting: boolean
}

const LEVEL_CONFIGS = [
    {
        name: 'Beach Cleanup',
        bgFrom: '#fef3c7',
        bgTo: '#fde68a',
        bgEmoji: '🏖️',
        timeLimit: 60,
        items: [
            { type: 'plastic-bag', emoji: '🛍️', label: 'Plastic Bag', category: 'recyclable' as WasteCategory, fact: 'A plastic bag takes 500-1000 years to decompose in a landfill.' },
            { type: 'glass-bottle', emoji: '🍾', label: 'Glass Bottle', category: 'recyclable' as WasteCategory, fact: 'Glass is 100% recyclable and can be recycled endlessly without loss in quality.' },
            { type: 'soda-can', emoji: '🥫', label: 'Aluminum Can', category: 'recyclable' as WasteCategory, fact: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours.' },
            { type: 'banana-peel', emoji: '🍌', label: 'Banana Peel', category: 'organic' as WasteCategory, fact: 'Banana peels decompose in about 2 years but can be composted in weeks!' },
            { type: 'apple-core', emoji: '🍎', label: 'Apple Core', category: 'organic' as WasteCategory, fact: 'Food waste in landfills produces methane, a greenhouse gas 80x worse than CO2.' },
            { type: 'battery', emoji: '🔋', label: 'Used Battery', category: 'hazardous' as WasteCategory, fact: 'One button battery can contaminate 600,000 liters of water if not disposed properly.' },
        ],
    },
    {
        name: 'Park Restoration',
        bgFrom: '#d1fae5',
        bgTo: '#a7f3d0',
        bgEmoji: '🌲',
        timeLimit: 50,
        items: [
            { type: 'newspaper', emoji: '📰', label: 'Old Newspaper', category: 'recyclable' as WasteCategory, fact: 'Recycling 1 ton of paper saves 17 trees and 7,000 gallons of water.' },
            { type: 'plastic-bottle', emoji: '🧴', label: 'Plastic Bottle', category: 'recyclable' as WasteCategory, fact: 'Only 9% of all plastic ever produced has been recycled. We can change this!' },
            { type: 'cardboard', emoji: '📦', label: 'Cardboard Box', category: 'recyclable' as WasteCategory, fact: 'Cardboard can be recycled 5-7 times before fibers become too short.' },
            { type: 'leaves', emoji: '🍂', label: 'Dead Leaves', category: 'organic' as WasteCategory, fact: 'Composted leaves make excellent natural fertilizer for gardens.' },
            { type: 'food-waste', emoji: '🥬', label: 'Veggie Scraps', category: 'organic' as WasteCategory, fact: '1/3 of all food produced globally is wasted. Composting helps close the loop.' },
            { type: 'paint-can', emoji: '🪣', label: 'Paint Can', category: 'hazardous' as WasteCategory, fact: 'Paint contains heavy metals and solvents that can contaminate soil and water.' },
            { type: 'spray-can', emoji: '🧯', label: 'Aerosol Can', category: 'hazardous' as WasteCategory, fact: 'Aerosol cans may contain propellants that harm the ozone layer.' },
            { type: 'coffee-grounds', emoji: '☕', label: 'Coffee Grounds', category: 'organic' as WasteCategory, fact: 'Coffee grounds are excellent for compost and can repel garden pests!' },
        ],
    },
    {
        name: 'River Rescue',
        bgFrom: '#dbeafe',
        bgTo: '#93c5fd',
        bgEmoji: '🏞️',
        timeLimit: 45,
        items: [
            { type: 'tire', emoji: '⭕', label: 'Old Tire', category: 'hazardous' as WasteCategory, fact: 'Tires take 2,000 years to decompose and leach toxic chemicals into water.' },
            { type: 'fish-net', emoji: '🪤', label: 'Fishing Net', category: 'recyclable' as WasteCategory, fact: 'Ghost fishing nets make up 10% of ocean plastic and trap marine life.' },
            { type: 'straw', emoji: '🥤', label: 'Plastic Straw', category: 'recyclable' as WasteCategory, fact: 'Americans use 500 million straws daily. Switch to reusable alternatives!' },
            { type: 'oil-can', emoji: '🛢️', label: 'Oil Container', category: 'hazardous' as WasteCategory, fact: '1 liter of oil can contaminate 1 million liters of drinking water.' },
            { type: 'seaweed', emoji: '🌿', label: 'Seaweed', category: 'organic' as WasteCategory, fact: 'Seaweed absorbs 5x more CO2 than land-based plants. It\'s a climate hero!' },
            { type: 'plastic-wrap', emoji: '🗞️', label: 'Plastic Wrap', category: 'recyclable' as WasteCategory, fact: 'Most cling film cannot be recycled. Use beeswax wraps instead!' },
            { type: 'eggshells', emoji: '🥚', label: 'Eggshells', category: 'organic' as WasteCategory, fact: 'Crushed eggshells add calcium to compost and deter slugs in gardens.' },
            { type: 'medicine', emoji: '💊', label: 'Old Medicine', category: 'hazardous' as WasteCategory, fact: 'Flushing medicine contaminates water. Use pharmacy take-back programs.' },
            { type: 'tin-can', emoji: '🥫', label: 'Tin Can', category: 'recyclable' as WasteCategory, fact: 'Steel cans are the most recycled packaging material in the world.' },
        ],
    },
]

const BIN_INFO: Record<WasteCategory, { emoji: string; label: string; color: string; bgColor: string; borderColor: string }> = {
    recyclable: { emoji: '♻️', label: 'Recyclable', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-400' },
    organic: { emoji: '🌱', label: 'Organic / Compost', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-400' },
    hazardous: { emoji: '⚠️', label: 'Hazardous', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-400' },
}

function generatePositions(count: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []
    const minDist = 14
    for (let i = 0; i < count; i++) {
        let tries = 0
        let pos = { x: 8 + Math.random() * 82, y: 8 + Math.random() * 72 }
        while (tries < 50) {
            const ok = positions.every(
                (p) => Math.hypot(p.x - pos.x, p.y - pos.y) > minDist
            )
            if (ok) break
            pos = { x: 8 + Math.random() * 82, y: 8 + Math.random() * 72 }
            tries++
        }
        positions.push(pos)
    }
    return positions
}

export function PollutionCleanupGame({ onComplete, isSubmitting }: PollutionCleanupGameProps) {
    const [level, setLevel] = useState(0)
    const [items, setItems] = useState<PollutionItem[]>([])
    const [selectedItem, setSelectedItem] = useState<PollutionItem | null>(null)
    const [score, setScore] = useState(0)
    const [combo, setCombo] = useState(0)
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIGS[0].timeLimit)
    const [showFact, setShowFact] = useState<string | null>(null)
    const [wrongSort, setWrongSort] = useState<string | null>(null)
    const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'level-complete' | 'finished'>('intro')
    const [totalCorrect, setTotalCorrect] = useState(0)
    const [totalWrong, setTotalWrong] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const config = LEVEL_CONFIGS[level]

    // Initialize level items
    const initLevel = useCallback((lvl: number) => {
        const cfg = LEVEL_CONFIGS[lvl]
        const positions = generatePositions(cfg.items.length)
        const newItems: PollutionItem[] = cfg.items.map((item, i) => ({
            id: i,
            x: positions[i].x,
            y: positions[i].y,
            ...item,
            collected: false,
            sorted: false,
            animating: false,
        }))
        setItems(newItems)
        setSelectedItem(null)
        setTimeLeft(cfg.timeLimit)
        setCombo(0)
        setShowFact(null)
        setWrongSort(null)
    }, [])

    // Start game
    const startGame = () => {
        setGamePhase('playing')
        setScore(0)
        setTotalCorrect(0)
        setTotalWrong(0)
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

    // Check level completion
    useEffect(() => {
        if (gamePhase !== 'playing') return
        const allSorted = items.length > 0 && items.every((i) => i.sorted)
        if (allSorted || timeLeft === 0) {
            if (timerRef.current) clearInterval(timerRef.current)
            const timeBonus = timeLeft * 2
            setScore((prev) => prev + timeBonus)
            setTimeout(() => {
                if (level < LEVEL_CONFIGS.length - 1) {
                    setGamePhase('level-complete')
                } else {
                    setGamePhase('finished')
                }
            }, 800)
        }
    }, [items, timeLeft, gamePhase, level])

    // Handle finishing
    useEffect(() => {
        if (gamePhase === 'finished' && !isSubmitting) {
            const finalScore = Math.min(Math.round((score / (LEVEL_CONFIGS.length * 200)) * 100), 100)
            setTimeout(() => onComplete(Math.max(finalScore, 60)), 1500)
        }
    }, [gamePhase, isSubmitting, score, onComplete])

    // Pick up item from the field
    const pickupItem = (item: PollutionItem) => {
        if (item.collected || item.sorted || gamePhase !== 'playing') return
        setSelectedItem(item)
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, collected: true, animating: true } : i))
        setShowFact(null)
        setWrongSort(null)
    }

    // Drop into bin
    const dropIntoBin = (binCategory: WasteCategory) => {
        if (!selectedItem || gamePhase !== 'playing') return
        const isCorrect = selectedItem.category === binCategory

        if (isCorrect) {
            const newCombo = combo + 1
            const comboBonus = Math.min(newCombo, 5) * 5
            const pointsEarned = 10 + comboBonus
            setScore((prev) => prev + pointsEarned)
            setCombo(newCombo)
            setTotalCorrect((prev) => prev + 1)
            setShowFact(selectedItem.fact)
            setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, sorted: true, animating: false } : i))
        } else {
            setCombo(0)
            setTotalWrong((prev) => prev + 1)
            setWrongSort(`Wrong bin! "${selectedItem.label}" is ${selectedItem.category}. Try again!`)
            setItems((prev) => prev.map((i) => i.id === selectedItem.id ? { ...i, collected: false, animating: false } : i))
        }

        setSelectedItem(null)
    }

    // Next level
    const nextLevel = () => {
        const next = level + 1
        setLevel(next)
        initLevel(next)
        setGamePhase('playing')
    }

    const unsortedCount = items.filter((i) => !i.sorted).length
    const totalItems = items.length
    const progress = totalItems > 0 ? ((totalItems - unsortedCount) / totalItems) * 100 : 0

    // ─── INTRO SCREEN ──────────────────────────────────────────────────
    if (gamePhase === 'intro') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🌍</div>
                    <h2 className="text-3xl font-bold text-emerald-800 mb-3">Pollution Cleanup Challenge</h2>
                    <p className="text-emerald-700 max-w-lg mx-auto mb-6">
                        Pick up pollution items and sort them into the correct waste bins.
                        Learn environmental facts, build combos for bonus points, and race against the clock across 3 levels!
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                        {Object.values(BIN_INFO).map((bin) => (
                            <div key={bin.label} className={`p-3 rounded-xl border-2 ${bin.borderColor} ${bin.bgColor}`}>
                                <div className="text-2xl mb-1">{bin.emoji}</div>
                                <div className={`text-xs font-semibold ${bin.color}`}>{bin.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                        {LEVEL_CONFIGS.map((cfg, i) => (
                            <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                                {cfg.bgEmoji} Level {i + 1}: {cfg.name}
                            </Badge>
                        ))}
                    </div>

                    <Button size="lg" onClick={startGame} className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
                        <Leaf className="h-5 w-5 mr-2" />
                        Start Cleanup!
                    </Button>
                </div>
            </div>
        )
    }

    // ─── LEVEL COMPLETE SCREEN ──────────────────────────────────────────
    if (gamePhase === 'level-complete') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-300 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-yellow-800 mb-2">Level {level + 1} Complete!</h2>
                    <p className="text-yellow-700 mb-2">{config.name} cleaned up successfully!</p>
                    <div className="text-2xl font-bold text-yellow-800 mb-6">Score: {score} pts</div>
                    <div className="flex justify-center gap-8 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
                            <div className="text-sm text-muted-foreground">Correct Sorts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">{totalWrong}</div>
                            <div className="text-sm text-muted-foreground">Wrong Sorts</div>
                        </div>
                    </div>
                    <p className="text-sm text-yellow-700 mb-4">
                        Next: <strong>{LEVEL_CONFIGS[level + 1].name}</strong> — {LEVEL_CONFIGS[level + 1].items.length} items, {LEVEL_CONFIGS[level + 1].timeLimit}s
                    </p>
                    <Button size="lg" onClick={nextLevel} className="bg-yellow-600 hover:bg-yellow-700 text-lg px-8">
                        <Zap className="h-5 w-5 mr-2" />
                        Next Level
                    </Button>
                </div>
            </div>
        )
    }

    // ─── FINISHED SCREEN ────────────────────────────────────────────────
    if (gamePhase === 'finished') {
        const accuracy = totalCorrect + totalWrong > 0
            ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
            : 0
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-200 border-2 border-emerald-400 rounded-2xl p-8 text-center">
                    <div className="text-7xl mb-4">🏆</div>
                    <h2 className="text-3xl font-bold text-emerald-800 mb-3">All Levels Complete!</h2>
                    <p className="text-emerald-700 mb-6">You've cleaned up all 3 environments. Amazing work!</p>

                    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-emerald-600">{score}</div>
                            <div className="text-xs text-muted-foreground">Total Points</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-yellow-600">{totalCorrect}</div>
                            <div className="text-xs text-muted-foreground">Items Sorted</div>
                        </div>
                    </div>

                    <p className="text-sm text-emerald-600 italic">
                        "The greatest threat to our planet is the belief that someone else will save it." — Robert Swan
                    </p>
                </div>
            </div>
        )
    }

    // ─── PLAYING SCREEN ─────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Level & Timer Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
                        {config.bgEmoji} Level {level + 1}: {config.name}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                        <Star className="h-3 w-3 mr-1" /> {score} pts
                    </Badge>
                    {combo >= 2 && (
                        <Badge className="bg-orange-500 text-white animate-pulse px-3 py-1">
                            <Zap className="h-3 w-3 mr-1" /> {combo}x Combo!
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                    <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cleanup Progress</span>
                    <span>{totalItems - unsortedCount}/{totalItems} sorted</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Fact / Error Feedback */}
            {showFact && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{showFact}</p>
                </div>
            )}
            {wrongSort && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{wrongSort}</p>
                </div>
            )}

            {/* Selected item indicator */}
            {selectedItem && (
                <div className="bg-amber-50 border-2 border-amber-300 border-dashed rounded-lg p-3 flex items-center justify-center gap-3 animate-in fade-in duration-200">
                    <span className="text-2xl">{selectedItem.emoji}</span>
                    <span className="font-semibold text-amber-800">
                        &quot;{selectedItem.label}&quot; picked up — choose the correct bin below!
                    </span>
                    <ArrowDown className="h-4 w-4 text-amber-600 animate-bounce" />
                </div>
            )}

            {/* Game Area */}
            <div
                className="relative rounded-2xl p-4 min-h-[380px] border-4 shadow-xl transition-all duration-700 overflow-hidden"
                style={{
                    background: `linear-gradient(to bottom, ${config.bgFrom}, ${config.bgTo})`,
                    borderColor: progress === 100 ? '#10b981' : '#e5e7eb',
                }}
            >
                {/* Background scene */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
                    <div className="text-[10rem] select-none">{config.bgEmoji}</div>
                </div>

                {/* Pollution items */}
                {items.map((item) =>
                    !item.sorted ? (
                        <button
                            key={item.id}
                            onClick={() => pickupItem(item)}
                            disabled={item.collected || isSubmitting}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group
                                ${item.collected
                                    ? 'scale-0 opacity-0 pointer-events-none'
                                    : 'hover:scale-125 cursor-pointer'
                                }`}
                            style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            title={item.label}
                        >
                            <div className="relative">
                                <span className="text-3xl sm:text-4xl block drop-shadow-md">{item.emoji}</span>
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-white/90 rounded px-1 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow">
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    ) : (
                        <div
                            key={item.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${item.x}%`, top: `${item.y}%` }}
                        >
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-40" />
                        </div>
                    )
                )}
            </div>

            {/* Sorting Bins */}
            <div className="grid grid-cols-3 gap-3">
                {(Object.entries(BIN_INFO) as [WasteCategory, typeof BIN_INFO['recyclable']][]).map(([cat, info]) => (
                    <button
                        key={cat}
                        onClick={() => dropIntoBin(cat)}
                        disabled={!selectedItem || isSubmitting}
                        className={`p-4 rounded-xl border-3 transition-all duration-200 text-center
                            ${selectedItem
                                ? `${info.bgColor} border-2 ${info.borderColor} hover:scale-105 hover:shadow-lg cursor-pointer ring-2 ring-offset-1 ring-transparent hover:ring-current`
                                : `bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed`
                            }`}
                    >
                        <div className="text-3xl mb-1">{info.emoji}</div>
                        <div className={`text-xs font-bold ${selectedItem ? info.color : 'text-gray-400'}`}>
                            {info.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {items.filter((i) => i.sorted && i.category === cat).length} sorted
                        </div>
                    </button>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">♻️</div>
                    <div className="text-lg font-bold text-blue-600">
                        {items.filter((i) => i.sorted && i.category === 'recyclable').length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Recycled</div>
                </Card>
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">🌱</div>
                    <div className="text-lg font-bold text-green-600">
                        {items.filter((i) => i.sorted && i.category === 'organic').length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Composted</div>
                </Card>
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">⚠️</div>
                    <div className="text-lg font-bold text-red-500">
                        {items.filter((i) => i.sorted && i.category === 'hazardous').length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Hazardous</div>
                </Card>
                <Card className="p-3 text-center">
                    <div className="text-xl mb-1">❌</div>
                    <div className="text-lg font-bold text-orange-500">{totalWrong}</div>
                    <div className="text-[10px] text-muted-foreground">Mistakes</div>
                </Card>
            </div>

            {/* Environmental Tip */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <TreePine className="h-4 w-4 text-green-600" /> Pro Tip
                </h4>
                <p className="text-xs text-muted-foreground">
                    {level === 0 && "Click a pollution item to pick it up, then click the correct bin to sort it. Build combos for bonus points!"}
                    {level === 1 && "Pay attention to item labels — some packaging looks recyclable but isn't. When in doubt, read the fact after sorting!"}
                    {level === 2 && "Hazardous waste must never go in regular bins. Oil, batteries, and chemicals need special disposal."}
                </p>
            </div>
        </div>
    )
}
