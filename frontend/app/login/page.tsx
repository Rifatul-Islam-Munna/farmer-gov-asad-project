"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UserLoginPage() {
  const [identifier, setIdentifier] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    const response = await fetch("/api/session/user-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: identifier, password }),
      credentials: "include",
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(body.message ?? "Could not sign in")
      setLoading(false)
      return
    }
    const from = new URLSearchParams(window.location.search).get("from")
    window.location.assign(from || "/marketplace")
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to continue</CardTitle>
          <CardDescription>Browse freely. Sign in only when you buy, save, chat, bid, rent, or sell.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2"><Label>Email or phone</Label><Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {message ? <p className="text-sm text-destructive">{message}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
