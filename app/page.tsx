"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { InteractiveMap } from "@/components/interactive-map"
import Galaxy from "@/components/galaxy"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Leaf, TreePine, Recycle, Users, Trophy, Star, ArrowRight, Sparkles,
  BookOpen, Gamepad2, Award, BarChart3, ShieldCheck, Zap,
  ChevronRight, Globe, GraduationCap, CheckCircle2, TrendingUp, Target,
  ArrowDown, Flame, Crown,
} from "lucide-react"
import { getGlobalStats, getUsers, getSchoolRankings, getSubmissions, getTasks } from "@/lib/storage-api"
import type { GlobalStats, User, School, Submission, Task } from "@/lib/storage-api"
import Link from "next/link"

/* ═══════════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started || target === 0) return
    let cur = 0
    const inc = target / (duration / 16)
    const t = setInterval(() => {
      cur += inc
      if (cur >= target) { setCount(target); clearInterval(t) }
      else setCount(Math.floor(cur))
    }, 16)
    return () => clearInterval(t)
  }, [started, target, duration])

  return { count, ref }
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SVG CHART COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function DonutChart({ segments, size = 140, stroke = 16 }: {
  segments: { value: number; color: string; label: string }[]
  size?: number; stroke?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = circ * (seg.value / total)
        const cur = offset; offset += dash
        return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-cur}
          strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      })}
      <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-2xl font-bold">{total}</text>
      <text x="50%" y="62%" textAnchor="middle" className="fill-muted-foreground text-[10px]">Total</text>
    </svg>
  )
}

function HBarChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="space-y-3">
      {bars.map((b, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium truncate max-w-[180px]">{b.label}</span>
            <span className="text-muted-foreground font-semibold tabular-nums">{b.value.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.max((b.value / max) * 100, 3)}%`, backgroundColor: b.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function VBarChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="flex items-end gap-2 h-32 justify-center">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[48px]">
          <span className="text-[10px] font-bold tabular-nums">{b.value}</span>
          <div className="w-full rounded-t-md transition-all duration-1000"
            style={{ height: `${Math.max((b.value / max) * 100, 5)}%`, backgroundColor: b.color, minHeight: 4 }} />
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const FEATURES = [
  { icon: BookOpen, title: "Interactive Lessons", desc: "Teacher-crafted lessons with quizzes, progress tracking, and instant feedback", color: "#2563eb", bg: "#eff6ff" },
  { icon: Target, title: "Verified Tasks", desc: "Complete real environmental tasks, submit photo evidence, and earn points", color: "#059669", bg: "#ecfdf5" },
  { icon: Gamepad2, title: "Educational Games", desc: "Fun multi-level games teaching waste sorting, water conservation, and more", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: Award, title: "Badge System", desc: "Unlock dynamic badges as you hit milestones and complete challenges", color: "#d97706", bg: "#fffbeb" },
  { icon: BarChart3, title: "Live Leaderboards", desc: "Compete with peers and schools — see real-time rankings and streaks", color: "#dc2626", bg: "#fef2f2" },
  { icon: ShieldCheck, title: "AI Verification", desc: "Task submissions are verified by AI image analysis for authenticity", color: "#0891b2", bg: "#ecfeff" },
]

const HOW_STEPS = [
  { n: "01", title: "Sign Up", desc: "Create a free student or teacher account", icon: GraduationCap },
  { n: "02", title: "Learn", desc: "Explore interactive lessons & topics", icon: BookOpen },
  { n: "03", title: "Act", desc: "Complete eco tasks & submit photo proof", icon: CheckCircle2 },
  { n: "04", title: "Earn", desc: "Gain points, badges & climb the board", icon: Trophy },
]

const CAT_COLORS: Record<string, string> = { planting: "#16a34a", waste: "#f59e0b", energy: "#8b5cf6", water: "#0ea5e9" }
const CAT_LABELS: Record<string, string> = { planting: "Planting", waste: "Waste", energy: "Energy", water: "Water" }

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_STATS: GlobalStats = {
  totalSaplings: 0, totalWasteSaved: 0, totalStudents: 0, totalTasks: 0, lastUpdated: new Date().toISOString(),
}

export default function HomePage() {
  const [stats, setStats] = useState<GlobalStats>(DEFAULT_STATS)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [topSchools, setTopSchools] = useState<Array<{ school: School; totalPoints: number; studentCount: number }>>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Fetch each independently so one failure doesn't block the page
    getGlobalStats().then(setStats).catch(e => console.error("Stats fetch failed:", e))
    getUsers().then(users => {
      setAllStudents(users.filter(u => u.role === "student").sort((a, b) => b.ecoPoints - a.ecoPoints))
    }).catch(e => console.error("Users fetch failed:", e))
    getSchoolRankings(10).then(setTopSchools).catch(e => console.error("Schools fetch failed:", e))
    getSubmissions().then(setSubmissions).catch(e => console.error("Submissions fetch failed:", e))
    getTasks().then(setTasks).catch(e => console.error("Tasks fetch failed:", e))
  }, [])

  /* derived */
  const catBreakdown = useMemo(() => {
    const c: Record<string, number> = {}
    tasks.forEach(t => { c[t.category] = (c[t.category] || 0) + 1 })
    return Object.entries(c).map(([k, v]) => ({ label: CAT_LABELS[k] || k, value: v, color: CAT_COLORS[k] || "#94a3b8" }))
  }, [tasks])

  const subStatus = useMemo(() => {
    let a = 0, p = 0, r = 0
    submissions.forEach(s => { if (s.status === "approved") a++; else if (s.status === "pending") p++; else r++ })
    return { approved: a, pending: p, rejected: r, total: submissions.length }
  }, [submissions])

  const topStudents = useMemo(() => allStudents.slice(0, 10), [allStudents])
  const top5Schools = useMemo(() => topSchools.slice(0, 5), [topSchools])

  /* counters — use live-fetched counts for students & tasks */
  const cntSap = useCountUp(stats.totalSaplings || 0)
  const cntWaste = useCountUp(stats.totalWasteSaved || 0)
  const cntStudents = useCountUp(allStudents.length)
  const cntTasks = useCountUp(tasks.length)

  /* reveals */
  const rvStats = useReveal()
  const rvCharts = useReveal()
  const rvFeatures = useReveal()
  const rvHow = useReveal()
  const rvMap = useReveal()
  const rvBoard = useReveal()
  const rvCta = useReveal()

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-primary text-white overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: 0.3 }}>
          <Galaxy density={1.5} glowIntensity={0.8} hueShift={0} speed={0.3} mouseInteraction transparent twinkleIntensity={1} repulsionStrength={4} starSpeed={0.2} />
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] left-[8%] w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute top-[60%] right-[12%] w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">Gamified Environmental Education Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight animate-slide-up">
            Make Earth<br />
            <span className="relative inline-block">
              <span className="relative z-10">Greener</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8 C60 2,120 2,150 6 S240 12,298 4" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}Together
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Join students and teachers across India in completing verified environmental actions, earning eco-points, and competing for a cleaner planet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 group">
              <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Students", value: allStudents.length, Icon: Users, sfx: "" },
              { label: "Trees Planted", value: stats.totalSaplings, Icon: TreePine, sfx: "" },
              { label: "Waste Saved", value: stats.totalWasteSaved, Icon: Recycle, sfx: " kg" },
              { label: "Tasks Done", value: tasks.length, Icon: Trophy, sfx: "" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3">
                <s.Icon className="h-4 w-4 text-white/60 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-white">{(s.value || 0).toLocaleString()}{s.sfx}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
            <ArrowDown className="h-5 w-5 text-white/40" />
          </div>
        </div>
      </section>

      {/* ══════════ IMPACT COUNTERS ══════════ */}
      <section className="py-20 px-4 bg-background relative" ref={rvStats.ref}>
        <div className="absolute top-0 inset-x-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(21,128,61,0.05), transparent)" }} />
        <div className="container mx-auto max-w-6xl transition-all duration-700" style={{ opacity: rvStats.visible ? 1 : 0, transform: rvStats.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><Globe className="h-3 w-3 mr-1" /> Live Impact</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Our Collective Environmental Impact</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Real-time data from students and schools making a measurable difference every day.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { r: cntSap, label: "Saplings Planted", Icon: TreePine, c: "#059669", bg: "#ecfdf5", br: "#a7f3d0", sfx: "" },
              { r: cntWaste, label: "Waste Saved (kg)", Icon: Recycle, c: "#16a34a", bg: "#f0fdf4", br: "#bbf7d0", sfx: " kg" },
              { r: cntStudents, label: "Active Students", Icon: Users, c: "#2563eb", bg: "#eff6ff", br: "#bfdbfe", sfx: "" },
              { r: cntTasks, label: "Tasks Completed", Icon: Trophy, c: "#d97706", bg: "#fffbeb", br: "#fde68a", sfx: "" },
            ].map(item => (
              <div key={item.label} ref={item.r.ref} className="rounded-2xl p-6 text-center hover-lift group" style={{ background: item.bg, border: `1px solid ${item.br}` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform" style={{ color: item.c }}>
                  <item.Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mb-1 tabular-nums" style={{ color: item.c }}>{item.r.count.toLocaleString()}{item.sfx}</div>
                <div className="text-sm text-muted-foreground font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CHARTS & ANALYTICS ══════════ */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)" }} ref={rvCharts.ref}>
        <div className="container mx-auto max-w-6xl transition-all duration-700" style={{ opacity: rvCharts.visible ? 1 : 0, transform: rvCharts.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><BarChart3 className="h-3 w-3 mr-1" /> Analytics</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Platform at a Glance</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Visualize our community&rsquo;s progress with real-time charts and breakdowns.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Task Category Donut */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Tasks by Category</h3>
                {catBreakdown.length > 0 ? (
                  <>
                    <DonutChart segments={catBreakdown} />
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                      {catBreakdown.map(s => (
                        <div key={s.label} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.color }} />
                          <span className="text-muted-foreground">{s.label} ({s.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-center py-8 text-muted-foreground text-sm">No tasks yet</p>}
              </CardContent>
            </Card>

            {/* Submissions Status Donut */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Submission Status</h3>
                {subStatus.total > 0 ? (
                  <>
                    <DonutChart segments={[
                      { value: subStatus.approved, color: "#16a34a", label: "Approved" },
                      { value: subStatus.pending, color: "#f59e0b", label: "Pending" },
                      { value: subStatus.rejected, color: "#dc2626", label: "Rejected" },
                    ]} />
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                      {[
                        { l: "Approved", v: subStatus.approved, c: "#16a34a" },
                        { l: "Pending", v: subStatus.pending, c: "#f59e0b" },
                        { l: "Rejected", v: subStatus.rejected, c: "#dc2626" },
                      ].map(s => (
                        <div key={s.l} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.c }} />
                          <span className="text-muted-foreground">{s.l} ({s.v})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-center py-8 text-muted-foreground text-sm">No submissions yet</p>}
              </CardContent>
            </Card>

            {/* Top 5 Students Vertical Bar */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Top 5 Students</h3>
                {topStudents.length > 0 ? (
                  <VBarChart bars={topStudents.slice(0, 5).map((s, i) => ({
                    label: s.name?.split(" ")[0] || `#${i + 1}`,
                    value: s.ecoPoints,
                    color: ["#16a34a", "#059669", "#0d9488", "#0891b2", "#2563eb"][i],
                  }))} />
                ) : <p className="text-center py-8 text-muted-foreground text-sm">No students yet</p>}
              </CardContent>
            </Card>

            {/* School Horizontal Bar */}
            <Card className="shadow-md border-0 md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> School Rankings — Total Eco-Points</h3>
                {top5Schools.length > 0 ? (
                  <HBarChart bars={top5Schools.map((r, i) => ({
                    label: r.school.name,
                    value: r.totalPoints,
                    color: ["#16a34a", "#059669", "#0d9488", "#0891b2", "#2563eb"][i],
                  }))} />
                ) : <p className="text-center py-8 text-muted-foreground text-sm">No school data yet</p>}
              </CardContent>
            </Card>

            {/* Quick Numbers */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Quick Numbers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Students", value: allStudents.length, Icon: Users, c: "#2563eb" },
                    { label: "Total Tasks", value: tasks.length, Icon: Target, c: "#059669" },
                    { label: "Submissions", value: submissions.length, Icon: CheckCircle2, c: "#7c3aed" },
                    { label: "Schools", value: topSchools.length, Icon: GraduationCap, c: "#d97706" },
                  ].map(n => (
                    <div key={n.label} className="rounded-xl p-3 text-center" style={{ background: `${n.c}08`, border: `1px solid ${n.c}20` }}>
                      <n.Icon className="h-4 w-4 mx-auto mb-1" style={{ color: n.c }} />
                      <div className="text-xl font-bold tabular-nums" style={{ color: n.c }}>{n.value}</div>
                      <div className="text-[10px] text-muted-foreground">{n.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="py-20 px-4 bg-background" ref={rvFeatures.ref}>
        <div className="container mx-auto max-w-6xl transition-all duration-700" style={{ opacity: rvFeatures.visible ? 1 : 0, transform: rvFeatures.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><Sparkles className="h-3 w-3 mr-1" /> Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything You Need to Go Green</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete gamified learning ecosystem designed for impactful environmental education.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="group hover-lift border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 group-hover:scale-110 transition-transform" style={{ background: f.bg, color: f.color }}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f0fdf4 100%)" }} ref={rvHow.ref}>
        <div className="container mx-auto max-w-5xl transition-all duration-700" style={{ opacity: rvHow.visible ? 1 : 0, transform: rvHow.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><Zap className="h-3 w-3 mr-1" /> How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Four Steps to Saving the Planet</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Getting started is easy. Here&apos;s how EcoCred turns everyday actions into environmental impact.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.n} className="relative text-center group">
                  {i < HOW_STEPS.length - 1 && <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="h-8 w-8" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">{item.n}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ INTERACTIVE MAP ══════════ */}
      <section className="py-20 px-4 bg-background" ref={rvMap.ref}>
        <div className="container mx-auto max-w-6xl transition-all duration-700" style={{ opacity: rvMap.visible ? 1 : 0, transform: rvMap.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><Globe className="h-3 w-3 mr-1" /> Impact Map</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">See Where Change Is Happening</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every dot is a verified environmental action taken by a student. Explore the growing map.</p>
          </div>
          <InteractiveMap />
        </div>
      </section>

      {/* ══════════ LEADERBOARDS ══════════ */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(180deg,#f0fdf4 0%,#fff 100%)" }} ref={rvBoard.ref}>
        <div className="container mx-auto max-w-6xl transition-all duration-700" style={{ opacity: rvBoard.visible ? 1 : 0, transform: rvBoard.visible ? "none" : "translateY(2rem)" }}>
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs font-semibold tracking-wider uppercase"><TrendingUp className="h-3 w-3 mr-1" /> Rankings</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Top Environmental Champions</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Students and schools leading the movement, ranked by eco-points and verified actions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Student Leaderboard — 3 cols */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Student Leaderboard</h3>
                <Link href="/signup" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">Join Now <ChevronRight className="h-3 w-3" /></Link>
              </div>
              {topStudents.length > 0 ? (
                <div className="space-y-3">
                  {topStudents.map((student, idx) => {
                    const isTop3 = idx < 3
                    const ringStyles: Record<number, React.CSSProperties> = {
                      0: { background: "#fefce8", boxShadow: "0 0 0 2px #facc15" },
                      1: { background: "#f9fafb", boxShadow: "0 0 0 2px #d1d5db" },
                      2: { background: "#fffbeb", boxShadow: "0 0 0 2px #f59e0b" },
                    }
                    return (
                      <Card key={student.id} className="hover-lift transition-all duration-300" style={{ border: isTop3 ? "none" : undefined, boxShadow: isTop3 ? "0 2px 12px rgba(0,0,0,0.08)" : undefined }}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={isTop3 ? ringStyles[idx] : { background: "#f1f5f9", color: "#64748b" }}>
                              {isTop3 ? <span className="text-lg">{medals[idx]}</span> : <span>{idx + 1}</span>}
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0" style={{ background: "rgba(21,128,61,0.1)" }}>
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{student.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                <span>Lvl {student.level || 1}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5"><Flame className="h-3 w-3 text-orange-500" />{student.streak}d</span>
                                <span>·</span>
                                <span>{student.badges?.length || 0} badges</span>
                                <span>·</span>
                                <span>{student.completedLessons?.length || 0} lessons</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-primary">{student.ecoPoints.toLocaleString()}</div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Eco-Points</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card style={{ border: "2px dashed #e5e7eb" }}>
                  <CardContent className="text-center py-16">
                    <Users className="h-14 w-14 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
                    <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                    <p className="text-muted-foreground mb-6 text-sm">Be the first to join our environmental community!</p>
                    <Button asChild><Link href="/signup">Join as Student</Link></Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* School Rankings — 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> School Rankings</h3>

              <Card className="shadow-md border-0">
                <CardContent className="p-5">
                  {top5Schools.length > 0 ? (
                    <div className="space-y-5">
                      {top5Schools.map((ranking, idx) => {
                        const maxPts = top5Schools[0]?.totalPoints || 1
                        const pct = (ranking.totalPoints / maxPts) * 100
                        const bgMap: Record<number, string> = { 0: "#fef9c3", 1: "#f3f4f6", 2: "#fff7ed" }
                        const brMap: Record<number, string> = { 0: "#fde047", 1: "#d1d5db", 2: "#fdba74" }
                        return (
                          <div key={ranking.school.id} className="group">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: bgMap[idx] || "#f1f5f9", border: `1px solid ${brMap[idx] || "#e2e8f0"}` }}>
                                {idx < 3 ? <span className="text-base">{medals[idx]}</span> : <span className="text-muted-foreground">{idx + 1}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{ranking.school.name}</p>
                                <p className="text-xs text-muted-foreground">{ranking.studentCount} students · {ranking.totalPoints.toLocaleString()} pts</p>
                              </div>
                            </div>
                            <div className="ml-12"><Progress value={pct} className="h-2" /></div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <Trophy className="h-10 w-10 mx-auto mb-3" style={{ opacity: 0.3 }} />
                      <p className="text-sm">No school rankings yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community card */}
              <Card className="border-0" style={{ background: "linear-gradient(135deg, rgba(21,128,61,0.05), rgba(5,150,105,0.05))" }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(21,128,61,0.1)" }}>
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Community Impact</p>
                      <p className="text-xs text-muted-foreground">Real numbers, real change</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Learners", val: allStudents.length, c: "#16a34a" },
                      { label: "Schools", val: topSchools.length, c: "#0891b2" },
                      { label: "Approved", val: subStatus.approved, c: "#7c3aed" },
                    ].map(n => (
                      <div key={n.label} className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                        <div className="text-lg font-bold" style={{ color: n.c }}>{n.val}</div>
                        <div className="text-[10px] text-muted-foreground">{n.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-24 px-4 bg-primary text-white overflow-hidden" ref={rvCta.ref}>
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.1 }}>
          <div className="absolute top-10 left-[10%] w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[15%] w-56 h-56 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10 transition-all duration-700" style={{ opacity: rvCta.visible ? 1 : 0, transform: rvCta.visible ? "none" : "translateY(2rem)" }}>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 text-sm"><Leaf className="h-4 w-4" /> Join the Movement</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to Make a<br />Real Difference?</h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">Every tree planted, every kilogram of waste saved, and every lesson learned adds up. Start your journey today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 group">
              <Link href="/signup">Create Free Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60">
              <Link href="/teacher">Teacher Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
