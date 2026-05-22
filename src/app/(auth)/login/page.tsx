"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Credenciales incorrectas")
        return
      }

      // Redirect based on role — middleware will handle the final destination
      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-[#1E3A5F] p-2">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1E3A5F]">GestorIA</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Acceder</h1>
        <p className="mt-1 text-sm text-[#64748B]">Introduce tu CIF o email y contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-4">
        <div>
          <Label htmlFor="identifier">CIF o Email</Label>
          <Input
            id="identifier"
            className="mt-1 font-mono"
            placeholder="B12345678 o admin@gestoría.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            className="mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Accediendo..." : "Acceder"}
        </Button>
      </form>
    </div>
  )
}
