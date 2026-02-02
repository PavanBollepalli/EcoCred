import { Navigation } from "@/components/navigation"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <SignupForm />
      </div>
    </div>
  )
}
