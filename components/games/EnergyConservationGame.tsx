"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Lightbulb, LightbulbOff, Zap, Star, CheckCircle2, Info } from 'lucide-react'

interface EnergyConservationGameProps {
  onComplete: (score: number) => void
  isSubmitting: boolean
}

/* ── Data ─────────────────────────────────────────────────────────────── */

interface RoomLight {
  id: string
  label: string
  watts: number
  isOn: boolean
  x: number
  y: number
  style: 'ceiling' | 'lamp' | 'tube'
}

interface RoomWindow {
  id: string
  label: string
  isOpen: boolean
  x: number
  y: number
  width: number
  height: number
}

const INITIAL_LIGHTS: RoomLight[] = [
  { id: 'ceiling', label: 'Ceiling Light', watts: 100, isOn: true, x: 50, y: 8, style: 'ceiling' },
  { id: 'tube', label: 'Tube Light', watts: 40, isOn: true, x: 50, y: 28, style: 'tube' },
  { id: 'lamp-l', label: 'Desk Lamp', watts: 60, isOn: true, x: 18, y: 62, style: 'lamp' },
  { id: 'lamp-r', label: 'Floor Lamp', watts: 60, isOn: true, x: 82, y: 55, style: 'lamp' },
]

const INITIAL_WINDOWS: RoomWindow[] = [
  { id: 'win-l', label: 'Left Window', isOpen: false, x: 8, y: 18, width: 18, height: 30 },
  { id: 'win-r', label: 'Right Window', isOpen: false, x: 74, y: 18, width: 18, height: 30 },
]

const LIGHT_TIPS: string[] = [
  'Switching off one 100 W bulb for 8 hours saves ≈ 0.8 kWh — enough to charge your phone 40 times!',
  'Incandescent bulbs waste 90% of their energy as heat. LEDs are 5× more efficient.',
  'Turn off lights when you leave a room — it becomes a habit that lasts a lifetime.',
  'A single bulb running all day can add ₹500+ to your yearly electricity bill.',
]

const WINDOW_TIPS: string[] = [
  'Sunlight provides natural Vitamin D and reduces the need for artificial lighting.',
  'Opening windows creates cross-ventilation, cutting AC dependence by up to 40%.',
  'Natural daylight boosts focus and mood — studies show 15% higher productivity!',
]

/* ── Component ────────────────────────────────────────────────────────── */

export function EnergyConservationGame({ onComplete, isSubmitting }: EnergyConservationGameProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'success'>('intro')
  const [lights, setLights] = useState<RoomLight[]>(INITIAL_LIGHTS.map(l => ({ ...l })))
  const [windows, setWindows] = useState<RoomWindow[]>(INITIAL_WINDOWS.map(w => ({ ...w })))
  const [score, setScore] = useState(0)
  const [tip, setTip] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [completionTriggered, setCompletionTriggered] = useState(false)

  const lightsOn = lights.filter(l => l.isOn).length
  const windowsClosed = windows.filter(w => !w.isOpen).length
  const allDone = lightsOn === 0 && windowsClosed === 0
  const totalActions = lights.length + windows.length
  const doneActions = (lights.length - lightsOn) + (windows.length - windowsClosed)

  /* timer */
  useEffect(() => {
    if (gamePhase !== 'playing') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gamePhase])

  /* completion check */
  useEffect(() => {
    if (gamePhase === 'playing' && allDone && !completionTriggered) {
      if (timerRef.current) clearInterval(timerRef.current)
      const timeBonus = Math.max(0, 30 - elapsed)
      const finalScore = Math.min(100, 70 + timeBonus)
      setScore(finalScore)
      setCompletionTriggered(true)
      setTimeout(() => setGamePhase('success'), 800)
    }
  }, [lights, windows, gamePhase, elapsed, allDone, completionTriggered])

  /* fire onComplete once */
  useEffect(() => {
    if (gamePhase === 'success' && !isSubmitting) {
      const t = setTimeout(() => onComplete(Math.max(score, 70)), 2500)
      return () => clearTimeout(t)
    }
  }, [gamePhase, isSubmitting, score, onComplete])

  const startGame = () => {
    setLights(INITIAL_LIGHTS.map(l => ({ ...l })))
    setWindows(INITIAL_WINDOWS.map(w => ({ ...w })))
    setScore(0)
    setElapsed(0)
    setCompletionTriggered(false)
    setGamePhase('playing')
    setTip('👆 Tap the glowing lights to switch them OFF, then open the windows to let sunlight in!')
  }

  const toggleLight = (id: string) => {
    if (gamePhase !== 'playing') return
    setLights(prev => prev.map(l => {
      if (l.id !== id) return l
      if (l.isOn) {
        setScore(s => s + 10)
        setTip(LIGHT_TIPS[Math.floor(Math.random() * LIGHT_TIPS.length)])
      }
      return { ...l, isOn: !l.isOn }
    }))
  }

  const toggleWindow = (id: string) => {
    if (gamePhase !== 'playing') return
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w
      if (!w.isOpen) {
        setScore(s => s + 15)
        setTip(WINDOW_TIPS[Math.floor(Math.random() * WINDOW_TIPS.length)])
      }
      return { ...w, isOpen: !w.isOpen }
    }))
  }

  /* visual helpers */
  const artificialLight = lightsOn / lights.length
  const naturalLight = (windows.length - windowsClosed) / windows.length

  /* ── INTRO ──────────────────────────────────────────────────────────── */
  if (gamePhase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-3xl font-bold text-amber-800 mb-3">Energy Conservation</h2>
          <p className="text-amber-700 max-w-md mx-auto mb-6">
            You walk into a room where all the lights are on and the windows are shut.
            <br /><strong>Save energy</strong> by switching off every light and opening the windows to let natural sunlight in!
          </p>

          <div className="bg-white/70 rounded-xl p-5 max-w-sm mx-auto mb-6 text-left space-y-2">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2">
              <Zap className="h-4 w-4" /> How to Play
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>💡 Tap each <strong>light</strong> to turn it OFF</li>
              <li>🪟 Tap each <strong>window</strong> to open it</li>
              <li>☀️ Once all lights are off &amp; windows are open — you win!</li>
              <li>⏱️ Finish faster for a higher score</li>
            </ul>
          </div>

          <Button size="lg" onClick={startGame} className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-3">
            <Zap className="h-5 w-5 mr-2" />
            Enter the Room
          </Button>
        </div>
      </div>
    )
  }

  /* ── SUCCESS ────────────────────────────────────────────────────────── */
  if (gamePhase === 'success') {
    const wattsOff = INITIAL_LIGHTS.reduce((s, l) => s + l.watts, 0)
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce">🌞</div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">Room Optimized!</h2>
          <p className="text-green-700 mb-6">You let in natural light and saved electricity — great job!</p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-amber-600">{score}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{wattsOff}W</div>
              <div className="text-xs text-muted-foreground">Saved</div>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{elapsed}s</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto text-sm text-green-800">
            <strong>Did you know?</strong> If every household switched off just one unnecessary light for one hour a day,
            it would save over <strong>4 billion kWh</strong> of electricity per year — enough to power a small country!
          </div>
        </div>
      </div>
    )
  }

  /* ── PLAYING — The Room ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="h-3 w-3 mr-1" /> {score} pts
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {doneActions}/{totalActions} done
          </Badge>
        </div>
        <Badge variant={elapsed > 25 ? 'destructive' : 'outline'} className="px-3 py-1 font-mono">
          ⏱ {elapsed}s
        </Badge>
      </div>

      {/* Progress strip */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-500 rounded-full"
          style={{ width: `${(doneActions / totalActions) * 100}%` }}
        />
      </div>

      {/* Tip bar */}
      {tip && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{tip}</p>
        </div>
      )}

      {/* ── Room Scene ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden border-4 shadow-2xl select-none"
        style={{
          borderColor: allDone ? '#22c55e' : '#d4a017',
          minHeight: 420,
        }}
      >
        {/* Sky - visible through open windows */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100" />

        {/* Wall */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background:
              artificialLight > 0
                ? `rgba(255,243,210,${0.7 + artificialLight * 0.3})`
                : naturalLight > 0
                  ? `rgba(235,248,255,${0.4 + naturalLight * 0.4})`
                  : 'rgba(60,60,80,0.85)',
          }}
        />

        {/* Floor */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700"
          style={{
            height: '22%',
            background: artificialLight > 0
              ? 'linear-gradient(to bottom, #c9a96e, #b8955a)'
              : naturalLight > 0
                ? 'linear-gradient(to bottom, #c4b08a, #b09a72)'
                : 'linear-gradient(to bottom, #4a4440, #3a3430)',
          }}
        />

        {/* Ceiling line */}
        <div className="absolute top-[6%] left-0 right-0 h-[2px] bg-gray-400/50" />

        {/* ── Windows ───────────────────────────────────────────────── */}
        {windows.map(w => (
          <button
            key={w.id}
            onClick={() => toggleWindow(w.id)}
            className="absolute group cursor-pointer transition-transform duration-200 hover:scale-105 z-10"
            style={{ left: `${w.x}%`, top: `${w.y}%`, width: `${w.width}%`, height: `${w.height}%` }}
            title={w.isOpen ? `${w.label} (open)` : `${w.label} — click to open`}
          >
            <div className="w-full h-full rounded-md border-4 border-amber-800 overflow-hidden relative">
              {w.isOpen ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-400/40 to-transparent" />
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 via-transparent to-transparent animate-pulse"
                    style={{ animationDuration: '3s' }}
                  />
                  <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-amber-800/70" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-amber-800/70" />
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-900 bg-green-200/80 rounded px-1.5 py-0.5">
                    ☀️ Open
                  </span>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-300 to-indigo-500" />
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-indigo-600/60 border-r border-indigo-700/40" />
                    <div className="flex-1 bg-indigo-600/60" />
                  </div>
                  <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-amber-800/70" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-amber-800/70" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 text-xs font-bold px-2 py-1 rounded shadow">🪟 Open me!</span>
                  </span>
                </>
              )}
            </div>
          </button>
        ))}

        {/* ── Lights ────────────────────────────────────────────────── */}
        {lights.map(l => {
          const isCeiling = l.style === 'ceiling'
          const isTube = l.style === 'tube'
          return (
            <button
              key={l.id}
              onClick={() => toggleLight(l.id)}
              className="absolute z-20 group cursor-pointer transition-transform duration-200 hover:scale-110"
              style={{
                left: `${l.x}%`,
                top: `${l.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={l.isOn ? `${l.label} (${l.watts}W) — click to turn OFF` : `${l.label} — OFF`}
            >
              {/* glow behind when on */}
              {l.isOn && (
                <div
                  className="absolute rounded-full animate-pulse pointer-events-none"
                  style={{
                    width: isCeiling ? 120 : isTube ? 100 : 70,
                    height: isCeiling ? 120 : isTube ? 60 : 70,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255,230,100,0.55) 0%, transparent 70%)',
                    animationDuration: '2s',
                  }}
                />
              )}

              <div className="relative flex flex-col items-center">
                {isCeiling && <div className="w-[2px] h-4 bg-gray-500 mb-0" />}

                <div
                  className={`rounded-xl flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                    l.isOn
                      ? 'bg-yellow-200 border-yellow-400 shadow-yellow-300/60'
                      : 'bg-gray-300 border-gray-400 shadow-gray-200/40'
                  } ${isTube ? 'w-24 h-8' : 'w-14 h-14'}`}
                >
                  {l.isOn ? (
                    <Lightbulb className={`text-yellow-600 ${isTube ? 'h-5 w-5' : 'h-7 w-7'}`} />
                  ) : (
                    <LightbulbOff className={`text-gray-500 ${isTube ? 'h-5 w-5' : 'h-7 w-7'}`} />
                  )}
                </div>

                {l.isOn && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {l.watts}
                  </span>
                )}

                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-white/95 rounded px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow border">
                  {l.label} {l.isOn ? `(${l.watts}W)` : '— OFF ✓'}
                </span>
              </div>
            </button>
          )
        })}

        {/* ── Furniture (decorative) ────────────────────────────────── */}
        <div className="absolute bottom-[22%] left-[10%] w-[22%] h-[14%] bg-amber-700/70 rounded-t-md border-t-2 border-x-2 border-amber-900/50 pointer-events-none" />
        <div className="absolute bottom-[22%] left-[34%] w-[8%] h-[10%] rounded-t-lg bg-gray-600/50 border-t-2 border-gray-700/40 pointer-events-none" />
        <div className="absolute bottom-[22%] right-[6%] w-[14%] h-[28%] pointer-events-none">
          <div className="w-full h-full bg-amber-800/60 rounded-t-sm border-2 border-amber-900/30 flex flex-col justify-evenly px-[3px] py-[2px]">
            <div className="h-[18%] bg-amber-600/50 rounded-sm" />
            <div className="h-[18%] bg-amber-600/50 rounded-sm" />
            <div className="h-[18%] bg-amber-600/50 rounded-sm" />
          </div>
        </div>
        <div className="absolute bottom-[22%] left-[56%] pointer-events-none text-3xl">🪴</div>

        {/* Sun-beam overlay when windows open */}
        {naturalLight > 0 && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              opacity: naturalLight * 0.25,
              background: 'linear-gradient(135deg, rgba(255,250,200,0.6) 0%, transparent 50%)',
            }}
          />
        )}

        {/* Dark overlay when lights off & windows closed */}
        {artificialLight === 0 && naturalLight === 0 && (
          <div className="absolute inset-0 bg-gray-900/70 pointer-events-none transition-opacity duration-500 flex items-center justify-center">
            <p className="text-white/80 text-lg font-semibold animate-pulse">🌑 It&apos;s dark! Open the windows…</p>
          </div>
        )}

        {/* Completion overlay */}
        {allDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-[2px] rounded-2xl z-30 animate-in fade-in duration-500">
            <div className="text-center text-white drop-shadow-lg">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-green-100 animate-bounce" />
              <h3 className="text-3xl font-bold">Room Optimized! ☀️</h3>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">💡</div>
          <div className="text-lg font-bold text-amber-600">{lightsOn}</div>
          <div className="text-[10px] text-muted-foreground">Lights On</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">🪟</div>
          <div className="text-lg font-bold text-sky-600">{windows.length - windowsClosed}</div>
          <div className="text-[10px] text-muted-foreground">Windows Open</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">⚡</div>
          <div className="text-lg font-bold text-green-600">
            {lights.filter(l => !l.isOn).reduce((s, l) => s + l.watts, 0)}W
          </div>
          <div className="text-[10px] text-muted-foreground">Energy Saved</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xl mb-1">⭐</div>
          <div className="text-lg font-bold text-purple-600">{score}</div>
          <div className="text-[10px] text-muted-foreground">Score</div>
        </Card>
      </div>
    </div>
  )
}
