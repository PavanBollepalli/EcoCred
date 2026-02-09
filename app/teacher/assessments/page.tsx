"use client"

import { AuthGuard } from '@/components/auth/auth-guard'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AssessmentsManager } from '@/components/teacher/assessments-manager'

export default function TeacherAssessmentsPage() {
    return (
        <AuthGuard allowedRoles={['teacher', 'admin']}>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                <Navigation />
                <main className="container mx-auto px-4 py-8 max-w-6xl">
                    <AssessmentsManager />
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}
