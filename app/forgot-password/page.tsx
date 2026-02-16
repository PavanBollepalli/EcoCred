import { Navigation } from "@/components/navigation"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
