"use client"

import * as React from "react"
import { RefreshCcw, ShieldCheck } from "lucide-react"

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

export function AdminLogin() {
  const [login, setLogin] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/session/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phoneNumber: login, password }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message ?? "Login failed")
      window.location.assign("/dashboard/admin")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Administrator sign in</CardTitle>
          <CardDescription>
            Access and refresh tokens stay in secure HTTP-only cookies. Browser
            local storage is not used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label className="mb-2">Email or phone</Label>
              <Input
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-2">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? (
                <RefreshCcw className="animate-spin" />
              ) : (
                <ShieldCheck />
              )}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
