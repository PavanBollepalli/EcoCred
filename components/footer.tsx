"use client"

import { Leaf, Heart } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-primary-foreground" />
              <span className="text-xl font-bold">EcoCred Web</span>
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-xs">
              Gamified Environmental Education & Verified Actions Platform. 
              Making environmental impact fun and rewarding for students worldwide.
            </p>
            <div className="flex items-center space-x-1 text-sm text-primary-foreground/70">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for the planet</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Home
              </Link>
              <Link href="/student" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Student Portal
              </Link>
              <Link href="/teacher" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Teacher Portal
              </Link>
              <Link href="/gallery" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Gallery
              </Link>
            </div>
          </div>

          {/* Team Credits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Made by Team EduVerse</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-primary-foreground/80">Sudheer</div>
                <div className="text-primary-foreground/80">Nischal</div>
                <div className="text-primary-foreground/80">Praveen</div>
                <div className="text-primary-foreground/80">Kushaal</div>
                <div className="text-primary-foreground/80">Sindhuja</div>
                <div className="text-primary-foreground/80">Sainandhan</div>
              </div>
            </div>
            <div className="pt-4 border-t border-primary-foreground/20">
              <p className="text-xs text-primary-foreground/60">
                © 2025 EduVerse. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/70">
              Empowering the next generation of environmental champions
            </div>
            <div className="flex items-center space-x-4 text-sm text-primary-foreground/70">
              <span>🌱 Sustainable</span>
              <span>🎓 Educational</span>
              <span>🌍 Global Impact</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
