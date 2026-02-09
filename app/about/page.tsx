import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TreePine, Recycle, Zap, Droplets, Award, Brain, Users, TrendingUp, Target, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
    title: 'About EcoCred | Environmental Education Platform',
    description: 'Learn about EcoCred\'s mission to gamify environmental education through AI-powered assessments, interactive games, and real-world impact tracking.',
    keywords: 'environmental education, gamification, sustainability, AI learning, eco-friendly, climate action',
    openGraph: {
        title: 'About EcoCred',
        description: 'Gamifying environmental education for a sustainable future',
        type: 'website',
    },
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            <Navigation />

            <main className="container mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-green-600 hover:bg-green-700">About EcoCred</Badge>
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Gamifying Environmental Education
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        EcoCred is an innovative platform that combines gamification, AI-powered learning, and real-world impact tracking to inspire environmental action in students.
                    </p>
                </div>

                {/* Mission Section */}
                <Card className="mb-12 border-2 border-green-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl flex items-center gap-3">
                            <Target className="h-8 w-8 text-green-600" />
                            Our Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg space-y-4">
                        <p>
                            At EcoCred, we believe that environmental education should be engaging, interactive, and impactful. Our mission is to empower students to become environmental champions by making sustainability education fun and rewarding.
                        </p>
                        <p>
                            Through our platform, students earn eco-points for completing tasks, learning lessons, taking assessments, and playing educational games. Every action contributes to both their personal growth and real-world environmental impact.
                        </p>
                    </CardContent>
                </Card>

                {/* Key Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Gamification */}
                    <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-6 w-6 text-purple-600" />
                                Gamification System
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Earn points, unlock badges, and climb leaderboards as you complete environmental tasks and lessons.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    Daily login rewards (+5 points)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    Achievement badges
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    School leaderboards
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* AI Assessments */}
                    <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-6 w-6 text-blue-600" />
                                AI-Powered Assessments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Teachers can generate custom assessments using AI, tailored to specific topics and syllabi.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-600" />
                                    AI-generated questions
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-600" />
                                    Automatic grading
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-600" />
                                    Detailed explanations
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Educational Games */}
                    <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-6 w-6 text-green-600" />
                                Interactive Games
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Learn through play with our collection of animated, educational environmental games.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-green-600" />
                                    Energy Conservation
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-green-600" />
                                    Waste Segregation
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-green-600" />
                                    Water & Pollution Cleanup
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Real-World Impact */}
                    <Card className="border-2 border-yellow-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                                Real-World Impact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Track actual environmental impact through verified task submissions with AI image analysis.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <TreePine className="h-4 w-4 text-yellow-600" />
                                    Tree planting tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <Recycle className="h-4 w-4 text-yellow-600" />
                                    Waste management
                                </li>
                                <li className="flex items-center gap-2">
                                    <Droplets className="h-4 w-4 text-yellow-600" />
                                    Resource conservation
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Teacher Tools */}
                    <Card className="border-2 border-orange-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-orange-600" />
                                Teacher Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Empower educators with tools to create tasks, lessons, assessments, and custom badges.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-orange-600" />
                                    Task creation & review
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-orange-600" />
                                    Lesson management
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-orange-600" />
                                    Custom badge design
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* AI Integration */}
                    <Card className="border-2 border-indigo-200 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-6 w-6 text-indigo-600" />
                                AI Integration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Advanced AI powers multiple features to enhance learning and verification.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    Image verification
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    Assessment generation
                                </li>
                                <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    Chat assistance
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* How It Works */}
                <Card className="mb-12 border-2 border-blue-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">How EcoCred Works</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                                    For Students
                                </h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Complete environmental tasks (planting, waste management, etc.)</li>
                                    <li>• Learn through interactive lessons and quizzes</li>
                                    <li>• Take AI-generated assessments</li>
                                    <li>• Play educational games</li>
                                    <li>• Earn points and unlock badges</li>
                                    <li>• Compete on school leaderboards</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                                    For Teachers
                                </h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Create and assign environmental tasks</li>
                                    <li>• Design custom lessons with quizzes</li>
                                    <li>• Generate AI-powered assessments</li>
                                    <li>• Create custom achievement badges</li>
                                    <li>• Review student submissions</li>
                                    <li>• Track class progress and impact</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Environmental Categories */}
                <Card className="mb-12 border-2 border-green-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <TreePine className="h-12 w-12 text-green-600 mx-auto mb-3" />
                                <h4 className="font-semibold mb-2">Tree Planting</h4>
                                <p className="text-sm text-muted-foreground">Plant and nurture trees to combat climate change</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Recycle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                                <h4 className="font-semibold mb-2">Waste Management</h4>
                                <p className="text-sm text-muted-foreground">Learn proper waste segregation and recycling</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                                <h4 className="font-semibold mb-2">Energy Conservation</h4>
                                <p className="text-sm text-muted-foreground">Reduce energy consumption and save resources</p>
                            </div>
                            <div className="text-center p-4 bg-cyan-50 rounded-lg">
                                <Droplets className="h-12 w-12 text-cyan-600 mx-auto mb-3" />
                                <h4 className="font-semibold mb-2">Water Conservation</h4>
                                <p className="text-sm text-muted-foreground">Preserve water through smart practices</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-12 shadow-xl">
                    <h2 className="text-4xl font-bold mb-4">Join the Environmental Revolution</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Start your journey towards a sustainable future today
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/signup"
                            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Get Started
                        </a>
                        <a
                            href="/login"
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
