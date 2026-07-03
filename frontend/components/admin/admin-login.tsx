"use client"

import * as React from "react"
import {
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { apiRequest } from "@/lib/admin-api"

export function AdminLogin({
  onLogin,
}: {
  onLogin: (token: string) => void
}) {
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await apiRequest<{ access_token: string }>(
        "/user/login-user",
        {
          method: "POST",
          body: JSON.stringify({ phoneNumber: login, password }),
        },
      )
      onLogin(response.access_token)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not sign in. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
      <section className="relative hidden overflow-hidden rounded-3xl bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-black/10" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Leaf className="size-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Farmer Government</p>
              <p className="text-sm text-primary-foreground/70">
                Agriculture operations platform
              </p>
            </div>
          </div>

          <div className="mt-20 max-w-xl">
            <Badge className="border-white/20 bg-white/10 text-white">
              Secure administration
            </Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight">
              Manage the entire marketplace from one professional workspace.
            </h1>
            <p className="mt-5 text-lg leading-8 text-primary-foreground/75">
              Review users, control listings, monitor deals, manage prices and
              understand platform performance in real time.
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-3">
          {[
            [Users, "User control", "Approvals and roles"],
            [BarChart3, "Live reports", "Charts and exports"],
            [ShieldCheck, "Protected", "Admin-only actions"],
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as React.ComponentType<{
              className?: string
            }>
            return (
              <div
                key={String(title)}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <FeatureIcon className="size-5" />
                <p className="mt-3 font-medium">{String(title)}</p>
                <p className="mt-1 text-xs text-primary-foreground/65">
                  {String(description)}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex items-center justify-center p-2 sm:p-8">
        <Card className="w-full max-w-md border-0 shadow-xl shadow-black/5 ring-1 ring-foreground/10">
          <CardHeader className="space-y-4 pb-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground lg:hidden">
              <Leaf className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Administrator sign in</CardTitle>
              <CardDescription className="mt-2 leading-6">
                Enter the configured administrator email or phone number.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="admin-login">Email or phone number</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-login"
                    className="h-11 pl-9"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    className="h-11 px-9"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button className="h-11 w-full" type="submit" disabled={loading}>
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ShieldCheck />
                )}
                {loading ? "Signing in…" : "Sign in securely"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Access is protected by the backend administrator role. Regular
                farmer, buyer, agent and seller accounts cannot use this panel.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
