"use client"

import * as React from "react"
import { KeyRound, Plus, Save, TestTube2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type KeyState = {
  id?: string
  key: string
  enabled: boolean
  priority: number
  health?: "unknown" | "healthy" | "degraded" | "quota" | "failed"
  lastSuccessAt?: string
  lastQuotaErrorAt?: string
  cooldownUntil?: string
  usageCount?: number
  lastTestedAt?: string
  lastError?: string
}

type ProviderHealth = Omit<KeyState, "id" | "key" | "priority" | "enabled">

type IntegrationSettings = {
  geminiApiKeys: KeyState[]
  geminiTextModel?: string
  geminiVisionModel?: string
  imageEmbeddingProvider?: string
  imageEmbeddingModel?: string
  windyApiKey?: string
  windyHealth?: ProviderHealth
  oneSignalAppId?: string
  oneSignalRestApiKey?: string
  oneSignalHealth?: ProviderHealth
  active?: boolean
}

const newKey = (): KeyState => ({ key: "", enabled: true, priority: 100, health: "unknown", usageCount: 0 })
const emptySettings: IntegrationSettings = { geminiApiKeys: [newKey()], active: true }

export function IntegrationSettingsPanel({ token }: { token: string }) {
  const [form, setForm] = React.useState<IntegrationSettings>(emptySettings)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState("")
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    let active = true
    void apiRequest<ApiEnvelope<IntegrationSettings>>("/admin/integrations", {}, token)
      .then((response) => {
        if (!active) return
        setForm({ ...emptySettings, ...response.data, geminiApiKeys: response.data.geminiApiKeys?.length ? response.data.geminiApiKeys : [newKey()] })
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load settings")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  function update<K extends keyof IntegrationSettings>(key: K, value: IntegrationSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateKey(index: number, patch: Partial<KeyState>) {
    update("geminiApiKeys", form.geminiApiKeys.map((item, i) => i === index ? { ...item, ...patch } : item))
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const response = await apiRequest<ApiEnvelope<IntegrationSettings>>("/admin/integrations", {
        method: "PATCH",
        body: JSON.stringify({ ...form, geminiApiKeys: form.geminiApiKeys.filter((item) => item.key) }),
      }, token)
      setForm({ ...emptySettings, ...response.data, geminiApiKeys: response.data.geminiApiKeys?.length ? response.data.geminiApiKeys : [newKey()] })
      setMessage("Provider settings saved securely.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings")
    } finally {
      setSaving(false)
    }
  }

  async function testProvider(provider: "gemini" | "windy" | "onesignal", keyId?: string) {
    const marker = `${provider}:${keyId ?? "main"}`
    setTesting(marker)
    setMessage("")
    try {
      const response = await apiRequest<ApiEnvelope<IntegrationSettings>>("/admin/integrations/test", {
        method: "POST",
        body: JSON.stringify({ provider, keyId }),
      }, token)
      setForm({ ...emptySettings, ...response.data, geminiApiKeys: response.data.geminiApiKeys?.length ? response.data.geminiApiKeys : [newKey()] })
      setMessage(`${provider} validation completed.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Provider validation failed")
    } finally {
      setTesting("")
    }
  }

  if (loading) return <div className="glass-panel h-80 animate-pulse rounded-3xl" aria-label="Loading integration settings" />

  return (
    <form className="space-y-4" onSubmit={save}>
      {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound /> Gemini key pool</CardTitle>
          <CardDescription>Keys remain encrypted and masked. Lower priority numbers are selected first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.geminiApiKeys.map((item, index) => (
            <div className="rounded-xl border p-4" key={item.id ?? `new-${index}`}>
              <div className="grid gap-3 lg:grid-cols-[1fr_110px_120px_auto_auto]">
                <Input type="password" autoComplete="off" value={item.key} placeholder={`Gemini key ${index + 1}`} onChange={(event) => updateKey(index, { key: event.target.value })} />
                <Input type="number" min={1} max={10000} value={item.priority} aria-label="Priority" onChange={(event) => updateKey(index, { priority: Number(event.target.value) || 100 })} />
                <Button type="button" variant={item.enabled ? "default" : "outline"} onClick={() => updateKey(index, { enabled: !item.enabled })}>{item.enabled ? "Enabled" : "Disabled"}</Button>
                <Button type="button" variant="outline" disabled={!item.id || testing === `gemini:${item.id}`} onClick={() => void testProvider("gemini", item.id)}><TestTube2 /> Test</Button>
                <Button type="button" variant="outline" size="icon" aria-label="Remove Gemini key" disabled={form.geminiApiKeys.length === 1} onClick={() => update("geminiApiKeys", form.geminiApiKeys.filter((_, i) => i !== index))}><Trash2 /></Button>
              </div>
              <Health state={item} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => update("geminiApiKeys", [...form.geminiApiKeys, { ...newKey(), priority: (form.geminiApiKeys.length + 1) * 100 }])}><Plus /> Add key</Button>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Text model" value={form.geminiTextModel ?? ""} onChange={(value) => update("geminiTextModel", value)} />
            <Field label="Vision model" value={form.geminiVisionModel ?? ""} onChange={(value) => update("geminiVisionModel", value)} />
            <Field label="Image embedding provider" value={form.imageEmbeddingProvider ?? ""} onChange={(value) => update("imageEmbeddingProvider", value)} />
            <Field label="Image embedding model" value={form.imageEmbeddingModel ?? ""} onChange={(value) => update("imageEmbeddingModel", value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Windy weather</CardTitle></CardHeader><CardContent className="space-y-3"><Field label="Windy API key" secret value={form.windyApiKey ?? ""} onChange={(value) => update("windyApiKey", value)} /><Button type="button" variant="outline" disabled={testing === "windy:main"} onClick={() => void testProvider("windy")}><TestTube2 /> Test Windy</Button><Health state={form.windyHealth} /></CardContent></Card>
        <Card><CardHeader><CardTitle>OneSignal notification</CardTitle></CardHeader><CardContent className="space-y-3"><Field label="OneSignal app ID" value={form.oneSignalAppId ?? ""} onChange={(value) => update("oneSignalAppId", value)} /><Field label="OneSignal REST API key" secret value={form.oneSignalRestApiKey ?? ""} onChange={(value) => update("oneSignalRestApiKey", value)} /><Button type="button" variant="outline" disabled={testing === "onesignal:main"} onClick={() => void testProvider("onesignal")}><TestTube2 /> Test OneSignal</Button><Health state={form.oneSignalHealth} /></CardContent></Card>
      </div>

      <Button type="submit" disabled={saving}><Save /> {saving ? "Saving…" : "Save provider settings"}</Button>
    </form>
  )
}

function Health({ state }: { state?: Partial<KeyState> }) {
  if (!state) return null
  return <div className="mt-3 grid gap-1 text-xs text-muted-foreground md:grid-cols-3"><span>Health: {state.health ?? "unknown"}</span><span>Usage/tests: {state.usageCount ?? 0}</span><span>Last success: {state.lastSuccessAt ? new Date(state.lastSuccessAt).toLocaleString() : "Never"}</span>{state.cooldownUntil ? <span>Cooldown: {new Date(state.cooldownUntil).toLocaleString()}</span> : null}{state.lastQuotaErrorAt ? <span>Quota error: {new Date(state.lastQuotaErrorAt).toLocaleString()}</span> : null}{state.lastError ? <span className="md:col-span-3">Last error: {state.lastError}</span> : null}</div>
}

function Field({ label, value, onChange, secret = false }: { label: string; value: string; onChange: (value: string) => void; secret?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={secret ? "password" : "text"} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
