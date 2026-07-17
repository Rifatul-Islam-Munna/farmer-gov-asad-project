"use client"

import * as React from "react"
import { KeyRound, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type IntegrationSettings = {
  geminiApiKeys: string[]
  geminiTextModel?: string
  geminiVisionModel?: string
  imageEmbeddingProvider?: string
  imageEmbeddingModel?: string
  windyApiKey?: string
  oneSignalAppId?: string
  oneSignalRestApiKey?: string
  active?: boolean
}

const emptySettings: IntegrationSettings = {
  geminiApiKeys: [""],
  geminiTextModel: "",
  geminiVisionModel: "",
  imageEmbeddingProvider: "",
  imageEmbeddingModel: "",
  windyApiKey: "",
  oneSignalAppId: "",
  oneSignalRestApiKey: "",
  active: true,
}

export function IntegrationSettingsPanel({ token }: { token: string }) {
  const [form, setForm] = React.useState<IntegrationSettings>(emptySettings)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    let active = true
    void apiRequest<ApiEnvelope<IntegrationSettings>>("/admin/integrations", {}, token)
      .then((response) => {
        if (!active) return
        setForm({
          ...emptySettings,
          ...response.data,
          geminiApiKeys: response.data.geminiApiKeys?.length
            ? response.data.geminiApiKeys
            : [""],
        })
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load settings")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  function update<K extends keyof IntegrationSettings>(key: K, value: IntegrationSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateKey(index: number, value: string) {
    update(
      "geminiApiKeys",
      form.geminiApiKeys.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const response = await apiRequest<ApiEnvelope<IntegrationSettings>>(
        "/admin/integrations",
        {
          method: "PATCH",
          body: JSON.stringify({
            ...form,
            geminiApiKeys: form.geminiApiKeys.filter(Boolean),
          }),
        },
        token,
      )
      setForm({
        ...emptySettings,
        ...response.data,
        geminiApiKeys: response.data.geminiApiKeys?.length
          ? response.data.geminiApiKeys
          : [""],
      })
      setMessage("Provider settings saved securely in the backend.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="glass-panel h-80 animate-pulse rounded-3xl" aria-label="Loading integration settings" />
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound /> Gemini</CardTitle>
          <CardDescription>
            One Gemini key pool can be used for text and image requests. Model names remain separately configurable.
            Keys are encrypted by NestJS and never returned unmasked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gemini API keys</Label>
            {form.geminiApiKeys.map((key, index) => (
              <div className="flex gap-2" key={`${index}-${key.slice(0, 4)}`}>
                <Input
                  type="password"
                  autoComplete="off"
                  value={key}
                  placeholder={`Gemini key ${index + 1}`}
                  onChange={(event) => updateKey(index, event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove Gemini key"
                  disabled={form.geminiApiKeys.length === 1}
                  onClick={() => update("geminiApiKeys", form.geminiApiKeys.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => update("geminiApiKeys", [...form.geminiApiKeys, ""])}
            >
              <Plus /> Add key
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Text model" value={form.geminiTextModel ?? ""} onChange={(value) => update("geminiTextModel", value)} />
            <Field label="Vision model" value={form.geminiVisionModel ?? ""} onChange={(value) => update("geminiVisionModel", value)} />
            <Field label="Image embedding provider" value={form.imageEmbeddingProvider ?? ""} onChange={(value) => update("imageEmbeddingProvider", value)} />
            <Field label="Image embedding model" value={form.imageEmbeddingModel ?? ""} onChange={(value) => update("imageEmbeddingModel", value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Windy weather</CardTitle><CardDescription>Used only by the NestJS weather provider.</CardDescription></CardHeader>
          <CardContent><Field label="Windy API key" secret value={form.windyApiKey ?? ""} onChange={(value) => update("windyApiKey", value)} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>OneSignal notification</CardTitle><CardDescription>Remote push remains OneSignal-only. The REST key stays encrypted in the backend.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Field label="OneSignal app ID" value={form.oneSignalAppId ?? ""} onChange={(value) => update("oneSignalAppId", value)} />
            <Field label="OneSignal REST API key" secret value={form.oneSignalRestApiKey ?? ""} onChange={(value) => update("oneSignalRestApiKey", value)} />
          </CardContent>
        </Card>
      </div>

      <Button type="submit" disabled={saving}>
        <Save /> {saving ? "Saving…" : "Save provider settings"}
      </Button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  secret = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  secret?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={secret ? "password" : "text"}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
