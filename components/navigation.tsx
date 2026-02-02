"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Leaf, User, GraduationCap, BarChart3, Home, BookOpen, Users, Settings, Image, LogOut } from "lucide-react"
import { getCurrentUserFromSession } from "@/lib/storage-api"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const currentUser = getCurrentUserFromSession()

  const handleLogout = () => {
    sessionStorage.removeItem('ecocred_current_user')
    window.location.href = '/login'
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    // Only show role-specific portal when user is logged in
    ...(currentUser?.role === 'student' ? [{ href: "/student", label: "Student Portal", icon: GraduationCap }] : []),
    ...(currentUser?.role === 'teacher' ? [{ href: "/teacher", label: "Teacher Portal", icon: User }] : []),
    ...(currentUser?.role === 'admin' ? [{ href: "/admin", label: "Admin Portal", icon: Settings }] : []),
    { href: "/gallery", label: "Gallery", icon: Image },
  ]

  const mobileNavItems = [
    { href: "/", label: "Home", icon: Home, description: "Overview & Statistics" },
    // Only show role-specific portal when user is logged in
    ...(currentUser?.role === 'student' ? [{ href: "/student", label: "Student Portal", icon: GraduationCap, description: "Tasks, Lessons & Progress" }] : []),
    ...(currentUser?.role === 'teacher' ? [{ href: "/teacher", label: "Teacher Portal", icon: User, description: "Manage Students & Tasks" }] : []),
    ...(currentUser?.role === 'admin' ? [{ href: "/admin", label: "Admin Portal", icon: Settings, description: "Manage schools & system" }] : []),
    { href: "/gallery", label: "Gallery", icon: Image, description: "View all task images" },
    // Only show login/signup if not logged in
    ...(!currentUser ? [
      { href: "/login", label: "Login", icon: Settings, description: "Sign in to your account" },
      { href: "/signup", label: "Sign Up", icon: Users, description: "Create new account" }
    ] : [
      { href: "/profile", label: "Profile", icon: User, description: "Manage your account" },
      { href: "#logout", label: "Logout", icon: LogOut, description: "Sign out of your account" }
    ]),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary hidden sm:block group-hover:text-green-600 transition-colors">EcoCred Web</span>
            <span className="text-lg font-bold text-primary sm:hidden group-hover:text-green-600 transition-colors">EcoCred</span>
            <span className="text-xs text-muted-foreground hidden sm:block -mt-1">Environmental Learning</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 px-4 py-2 rounded-lg hover:bg-primary/5 hover:shadow-sm group"
              >
                <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          {/* User Status Badge */}
          {currentUser && (
            <div className="ml-4 flex items-center space-x-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">{currentUser.name}</span>
                </div>
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span className="font-medium text-primary">{currentUser.ecoPoints}</span>
                <span>points</span>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
            <div className="flex flex-col h-full">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">EcoCred Web</h2>
                    <p className="text-green-100 text-sm">Environmental Learning Platform</p>
                  </div>
                </div>

                {/* User Info */}
                {currentUser && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{currentUser.name}</p>
                        <p className="text-green-100 text-sm capitalize">{currentUser.role}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="bg-white/20 rounded-full px-2 py-1">
                            <span className="text-xs text-white font-medium">{currentUser.ecoPoints} points</span>
                          </div>
                          <div className="bg-white/20 rounded-full px-2 py-1">
                            <span className="text-xs text-white font-medium">{currentUser.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {mobileNavItems.map((item, index) => {
                    const Icon = item.icon
                    const isSpecial = item.href === '/login' || item.href === '/signup'
                    const isLogout = item.href === '#logout'
                    
                    if (isLogout) {
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            setIsOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 group hover:bg-red-50 hover:shadow-md border border-transparent hover:border-red-200 w-full text-left"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 group-hover:bg-red-200">
                            <Icon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-red-600">{item.label}</p>
                            <p className="text-sm text-red-500">{item.description}</p>
                          </div>
                        </button>
                      )
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 group ${
                          isSpecial 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg' 
                            : 'hover:bg-primary/5 hover:shadow-md border border-transparent hover:border-primary/20'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSpecial 
                            ? 'bg-white/20' 
                            : 'bg-primary/10 group-hover:bg-primary/20'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            isSpecial 
                              ? 'text-white' 
                              : 'text-primary group-hover:text-primary'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            isSpecial ? 'text-white' : 'text-foreground'
                          }`}>
                            {item.label}
                          </p>
                          <p className={`text-sm ${
                            isSpecial ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                        {isSpecial && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>© 2025 EduVerse Team</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Made with ❤️ for the environment
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
