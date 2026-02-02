import { Navigation } from "@/components/navigation"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <LoginForm />
      </div>
    </div>
  )
}
