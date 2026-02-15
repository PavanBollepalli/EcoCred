"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Droplets, Droplet, Star, CheckCircle2, Info, Wrench } from 'lucide-react'

interface WaterConservationGameProps {
  onComplete: (score: number) => void
  isSubmitting: boolean
}

/* ── Types & Data ─────────────────────────────────────────────────────── */

interface PipeSegment {
  id: string
  /** SVG path "d" attribute for drawing the pipe */
  path: string
}

interface LeakPoint {
  id: string
  label: string
  x: number // percentage
  y: number
  severity: 'minor' | 'moderate' | 'major'
  lossRate: number // litres per second
  isFixed: boolean
  fixDescription: string
  fact: string
}

const PIPE_SEGMENTS: PipeSegment[] = [
  // main horizontal trunk
  { id: 'main-1', path: 'M 4,50 L 30,50' },
  { id: 'main-2', path: 'M 30,50 L 55,50' },
  { id: 'main-3', path: 'M 55,50 L 80,50' },
  { id: 'main-4', path: 'M 80,50 L 96,50' },
  // branch up-left
  { id: 'branch-ul', path: 'M 30,50 L 30,22' },
  // branch down-center
  { id: 'branch-dc', path: 'M 55,50 L 55,78' },
  // branch up-right
  { id: 'branch-ur', path: 'M 80,50 L 80,22' },
]

const INITIAL_LEAKS: LeakPoint[] = [
  {
    id: 'leak-1', label: 'Cracked Joint', x: 18, y: 48,
    severity: 'moderate', lossRate: 4, isFixed: false,
    fixDescription: 'Replaced the worn-out rubber gasket and tightened the joint.',
    fact: 'A single cracked pipe joint can waste over 15,000 litres of water per year.',
  },
  {
    id: 'leak-2', label: 'Corroded Pipe', x: 42, y: 48,
    severity: 'major', lossRate: 8, isFixed: false,
    fixDescription: 'Cut out the corroded section and welded in a new pipe segment.',
    fact: 'Corroded pipes are responsible for up to 30% of water losses in old city networks.',
  },
  {
    id: 'leak-3', label: 'Loose Valve', x: 68, y: 48,
    severity: 'minor', lossRate: 2, isFixed: false,
    fixDescription: 'Replaced the valve seal and tightened the handle bolts.',
    fact: 'A dripping valve wastes about 11,000 litres per year — enough for 55 baths!',
  },
  {
    id: 'leak-4', label: 'Burst Branch Pipe', x: 29, y: 30,
    severity: 'major', lossRate: 10, isFixed: false,
    fixDescription: 'Applied an emergency pipe clamp and scheduled full replacement.',
    fact: 'A burst household pipe can flood a room with 400 litres per hour.',
  },
  {
    id: 'leak-5', label: 'Hairline Crack', x: 54, y: 68,
    severity: 'minor', lossRate: 1, isFixed: false,
    fixDescription: 'Sealed with epoxy putty — a quick fix anyone can do at home.',
    fact: 'Hairline cracks are often invisible but can waste 5 litres per day unnoticed.',
  },
  {
    id: 'leak-6', label: 'Broken Connector', x: 79, y: 30,
    severity: 'moderate', lossRate: 5, isFixed: false,
    fixDescription: 'Replaced the old connector with a brass compression fitting.',
    fact: 'Upgrading old connectors to brass fittings can extend pipe life by 20 years.',
  },
]

const SEVERITY_COLORS: Record<string, { bg: string; ring: string; text: string }> = {
  minor:    { bg: 'bg-yellow-100', ring: 'ring-yellow-400', text: 'text-yellow-700' },
  moderate: { bg: 'bg-orange-100', ring: 'ring-orange-400', text: 'text-orange-700' },
  major:    { bg: 'bg-red-100',    ring: 'ring-red-400',    text: 'text-red-700' },
}

/* ── Component ────────────────────────────────────────────────────────── */

export function WaterConservationGame({ onComplete, isSubmitting }: WaterConservationGameProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'success'>('intro')
  const [leaks, setLeaks] = useState<LeakPoint[]>(INITIAL_LEAKS.map(l => ({ ...l })))
  const [score, setScore] = useState(0)
  const [waterWasted, setWaterWasted] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [tip, setTip] = useState<string | null>(null)
  const [fixingId, setFixingId] = useState<string | null>(null) // currently animating
  const [completionTriggered, setCompletionTriggered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const wasteRef = useRef<NodeJS.Timeout | null>(null)

  const leaksFixed = leaks.filter(l => l.isFixed).length
  const totalLeaks = leaks.length
  const allFixed = leaksFixed === totalLeaks
  const currentLossRate = leaks.filter(l => !l.isFixed).reduce((s, l) => s + l.lossRate, 0)
  const pipeIntegrity = Math.round((leaksFixed / totalLeaks) * 100)

  /* timer */
  useEffect(() => {
    if (gamePhase !== 'playing') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gamePhase])

  /* water waste accumulator */
  useEffect(() => {
    if (gamePhase !== 'playing') return
    wasteRef.current = setInterval(() => {
      setLeaks(current => {
        const rate = current.filter(l => !l.isFixed).reduce((s, l) => s + l.lossRate, 0)
        if (rate > 0) setWaterWasted(prev => prev + rate)
        return current
      })
    }, 1000)
    return () => { if (wasteRef.current) clearInterval(wasteRef.current) }
  }, [gamePhase])

  /* completion check */
  useEffect(() => {
    if (gamePhase === 'playing' && allFixed && !completionTriggered) {
      if (timerRef.current) clearInterval(timerRef.current)
      if (wasteRef.current) clearInterval(wasteRef.current)
      const timeBonus = Math.max(0, 40 - elapsed)
      const wasteBonus = Math.max(0, 20 - Math.floor(waterWasted / 50))
      const finalScore = Math.min(100, 60 + timeBonus + wasteBonus)
      setScore(finalScore)
      setCompletionTriggered(true)
      setTimeout(() => setGamePhase('success'), 1000)
    }
  }, [leaks, gamePhase, elapsed, waterWasted, allFixed, completionTriggered])

  /* fire onComplete */
  useEffect(() => {
    if (gamePhase === 'success' && !isSubmitting) {
      const t = setTimeout(() => onComplete(Math.max(score, 65)), 2500)
      return () => clearTimeout(t)
    }
  }, [gamePhase, isSubmitting, score, onComplete])

  const startGame = () => {
    setLeaks(INITIAL_LEAKS.map(l => ({ ...l })))
    setScore(0)
    setWaterWasted(0)
    setElapsed(0)
    setCompletionTriggered(false)
    setFixingId(null)
    setGamePhase('playing')
    setTip('🔧 Tap the leaking spots (marked in red/orange/yellow) to repair them! Fix them fast before water is wasted.')
  }

  const fixLeak = (id: string) => {
    if (gamePhase !== 'playing' || fixingId) return
    const leak = leaks.find(l => l.id === id)
    if (!leak || leak.isFixed) return

    // Start fixing animation
    setFixingId(id)

    setTimeout(() => {
      const pointsMap = { minor: 10, moderate: 15, major: 25 }
      setScore(s => s + (pointsMap[leak.severity] || 10))
      setLeaks(prev => prev.map(l => l.id === id ? { ...l, isFixed: true } : l))
      setTip(`✅ ${leak.fixDescription}\n💡 ${leak.fact}`)
      setFixingId(null)
    }, 800)
  }

  /* ── INTRO ──────────────────────────────────────────────────────────── */
  if (gamePhase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-300 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h2 className="text-3xl font-bold text-cyan-800 mb-3">Water Conservation</h2>
          <p className="text-cyan-700 max-w-md mx-auto mb-6">
            The water pipeline has <strong>6 leaks</strong>! Water is being wasted every second.
            <br />Find and <strong>repair every leak</strong> before too much water is lost.
          </p>

          <div className="bg-white/70 rounded-xl p-5 max-w-sm mx-auto mb-6 text-left space-y-2">
            <h4 className="font-semibold text-cyan-800 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> How to Play
            </h4>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li>💧 Spot the <strong>leaking points</strong> on the pipeline</li>
              <li>🔧 Tap a leak to <strong>repair</strong> it</li>
              <li>⏱️ Act quickly — water waste increases every second!</li>
              <li>🏆 Fix all 6 leaks to complete the game</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-500" />
              <span className="text-xs text-muted-foreground">Minor</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-400 ring-2 ring-orange-500" />
              <span className="text-xs text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-400 ring-2 ring-red-500" />
              <span className="text-xs text-muted-foreground">Major</span>
            </div>
          </div>

          <Button size="lg" onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-3">
            <Wrench className="h-5 w-5 mr-2" />
            Start Fixing!
          </Button>
        </div>
      </div>
    )
  }

  /* ── SUCCESS ────────────────────────────────────────────────────────── */
  if (gamePhase === 'success') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-200 border-2 border-blue-400 rounded-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce">💧</div>
          <h2 className="text-3xl font-bold text-blue-800 mb-2">Pipeline Repaired!</h2>
          <p className="text-blue-700 mb-6">All leaks are fixed — clean water is flowing again!</p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-cyan-600">{score}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-red-500">{Math.round(waterWasted)}L</div>
              <div className="text-xs text-muted-foreground">Water Lost</div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{elapsed}s</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto text-sm text-blue-800">
            <strong>Did you know?</strong> Globally, leaking pipes waste <strong>32 billion cubic metres</strong> of
            treated water every year. Reporting leaks in your community can make a real difference!
          </div>
        </div>
      </div>
    )
  }

  /* ── PLAYING ────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="h-3 w-3 mr-1" /> {score} pts
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            🔧 {leaksFixed}/{totalLeaks} fixed
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className={`px-3 py-1 ${currentLossRate > 0 ? 'animate-pulse' : ''}`}>
            <Droplet className="h-3 w-3 mr-1" />
            {currentLossRate > 0 ? `-${currentLossRate} L/s` : 'No leaks!'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 font-mono">
            ⏱ {elapsed}s
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pipeline Integrity: {pipeIntegrity}%</span>
          <span>Water Lost: {Math.round(waterWasted)} L</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 transition-all duration-500 rounded-full"
            style={{ width: `${pipeIntegrity}%` }}
          />
        </div>
      </div>

      {/* Tip */}
      {tip && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 whitespace-pre-line">{tip}</p>
        </div>
      )}

      {/* ── Pipeline Scene ─────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden border-4 shadow-2xl select-none"
        style={{
          borderColor: allFixed ? '#22c55e' : '#0891b2',
          minHeight: 380,
          background: 'linear-gradient(to bottom, #e0f4fe, #d4edf7 40%, #8b7355 40%, #7a6248)',
        }}
      >
        {/* Ground texture */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)' }}
        />

        {/* Water source (left) */}
        <div className="absolute left-[1%] top-[38%] z-10 pointer-events-none">
          <div className="text-3xl">🏗️</div>
          <div className="text-[9px] text-center font-bold text-blue-900 bg-blue-200/80 px-1 rounded">Source</div>
        </div>

        {/* Destination (right) */}
        <div className="absolute right-[1%] top-[38%] z-10 pointer-events-none">
          <div className="text-3xl">🏠</div>
          <div className="text-[9px] text-center font-bold text-green-900 bg-green-200/80 px-1 rounded">Homes</div>
        </div>

        {/* Branch destinations */}
        <div className="absolute left-[27%] top-[6%] z-10 pointer-events-none text-center">
          <div className="text-2xl">🏫</div>
          <div className="text-[8px] font-bold text-blue-800">School</div>
        </div>
        <div className="absolute left-[52%] bottom-[5%] z-10 pointer-events-none text-center">
          <div className="text-2xl">🌳</div>
          <div className="text-[8px] font-bold text-green-800">Park</div>
        </div>
        <div className="absolute left-[77%] top-[6%] z-10 pointer-events-none text-center">
          <div className="text-2xl">🏥</div>
          <div className="text-[8px] font-bold text-blue-800">Hospital</div>
        </div>

        {/* SVG Pipeline */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {PIPE_SEGMENTS.map(seg => (
            <g key={seg.id}>
              {/* pipe shadow */}
              <path d={seg.path} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="4.5" strokeLinecap="round" />
              {/* pipe body */}
              <path d={seg.path} fill="none" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
              {/* pipe highlight */}
              <path d={seg.path} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5,3" />
            </g>
          ))}

          {/* Water flow animation inside pipe (only through fixed sections) */}
          {pipeIntegrity > 0 && (
            <path
              d="M 4,50 L 30,50 L 55,50 L 80,50 L 96,50"
              fill="none"
              stroke="rgba(56,189,248,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2,4"
              style={{
                opacity: pipeIntegrity / 100,
              }}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
            </path>
          )}
        </svg>

        {/* ── Leak Points ──────────────────────────────────────────── */}
        {leaks.map(leak => {
          const colors = SEVERITY_COLORS[leak.severity]
          const isFixing = fixingId === leak.id
          return (
            <button
              key={leak.id}
              onClick={() => !leak.isFixed && fixLeak(leak.id)}
              disabled={leak.isFixed || !!fixingId || isSubmitting}
              className={`absolute z-20 group transition-transform duration-200 ${
                leak.isFixed ? 'pointer-events-none' : 'cursor-pointer hover:scale-110'
              } ${isFixing ? 'scale-110' : ''}`}
              style={{
                left: `${leak.x}%`,
                top: `${leak.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={leak.isFixed ? `${leak.label} — Fixed ✓` : `${leak.label} — tap to repair`}
            >
              {leak.isFixed ? (
                /* Fixed state */
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              ) : isFixing ? (
                /* Fixing animation */
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center shadow-lg animate-spin" style={{ animationDuration: '0.6s' }}>
                    <Wrench className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              ) : (
                /* Leaking state */
                <div className="relative">
                  {/* Glow / pulse */}
                  <div
                    className={`absolute inset-0 rounded-full ${colors.ring} animate-ping opacity-40`}
                    style={{ animationDuration: leak.severity === 'major' ? '0.8s' : '1.5s' }}
                  />
                  <div className={`w-14 h-14 rounded-full ${colors.bg} ring-2 ${colors.ring} flex items-center justify-center shadow-lg relative`}>
                    {/* Spray drops */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-[2px]">
                      {Array.from({ length: Math.min(leak.lossRate, 5) }).map((_, i) => (
                        <Droplet
                          key={i}
                          className="h-3 w-3 text-cyan-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.6s' }}
                        />
                      ))}
                    </div>
                    {/* Icon */}
                    <span className="text-2xl">💧</span>
                  </div>

                  {/* Severity badge */}
                  <span className={`absolute -top-1 -right-1 text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    leak.severity === 'major' ? 'bg-red-500 text-white'
                    : leak.severity === 'moderate' ? 'bg-orange-500 text-white'
                    : 'bg-yellow-500 text-white'
                  }`}>
                    {leak.lossRate}
                  </span>

                  {/* Hover label */}
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-semibold bg-white/95 rounded px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow border">
                    {leak.label} ({leak.lossRate} L/s)
                  </span>
                </div>
              )}
            </button>
          )
        })}

        {/* All-fixed overlay */}
        {allFixed && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-[2px] z-30 animate-in fade-in duration-500">
            <div className="text-center text-white drop-shadow-lg">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-green-100 animate-bounce" />
              <h3 className="text-3xl font-bold">Pipeline Repaired! 💧</h3>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">🔧</div>
          <div className="text-lg font-bold text-green-600">{leaksFixed}</div>
          <div className="text-[10px] text-muted-foreground">Leaks Fixed</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">💧</div>
          <div className="text-lg font-bold text-red-500">{Math.round(waterWasted)}L</div>
          <div className="text-[10px] text-muted-foreground">Water Lost</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">📊</div>
          <div className="text-lg font-bold text-cyan-600">{pipeIntegrity}%</div>
          <div className="text-[10px] text-muted-foreground">Integrity</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">⭐</div>
          <div className="text-lg font-bold text-purple-600">{score}</div>
          <div className="text-[10px] text-muted-foreground">Score</div>
        </Card>
      </div>

      {/* Water waste meter */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-3 border">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-red-500 font-semibold">💧 Wasting:</span>
          <span className="font-mono font-bold text-red-600">{currentLossRate} L/s</span>
        </div>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${pipeIntegrity}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-green-600 font-semibold">✅ Fixed:</span>
          <span className="font-mono font-bold text-green-600">{leaksFixed}/{totalLeaks}</span>
        </div>
      </div>
    </div>
  )
}
