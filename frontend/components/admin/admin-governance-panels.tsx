"use client"

import * as React from "react"
import { Archive, BadgeCheck, FileCheck2, ImagePlus, LoaderCircle, Play, RefreshCcw, RotateCcw, UploadCloud, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type ReviewDocument = {
  key: string
  label: string
  url: string
  status: "pending" | "approved" | "rejected"
  note?: string
}

type ProfessionalReview = {
  id: string
  userId: string
  role: string
  status: "pending" | "inReview" | "approved" | "rejected"
  documents: ReviewDocument[]
  checklist: Record<string, boolean>
  reviewerNote?: string
  createdAt: string
}

type ImageProfileItem = {
  id: string
  objectKey: string
  originalName: string
  contentType: string
  sizeBytes: number
  checksum?: string
  qualityScore?: number
  status: "pending" | "ready" | "duplicate" | "rejected" | "failed"
  error?: string
}

type ImageProfile = {
  id: string
  code: string
  name: string
  description?: string
  diseaseCode?: string
  cropCode?: string
  status: "draft" | "processing" | "active" | "archived" | "failed"
  version: number
  items: ImageProfileItem[]
  readyCount: number
  duplicateCount: number
  failedCount: number
  evaluationScore?: number
}

export function ProfessionalReviewsPanel() {
  const [items, setItems] = React.useState<ProfessionalReview[]>([])
  const [loading, setLoading] = React.useState(true)
  const [message, setMessage] = React.useState("")
  const [notes, setNotes] = React.useState<Record<string, string>>({})

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiRequest<ApiEnvelope<ProfessionalReview[]>>("/admin/professional-reviews")
      setItems(response.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load reviews")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function decide(review: ProfessionalReview, status: "approved" | "rejected" | "inReview") {
    const documentDecisions = Object.fromEntries(
      review.documents.map((document) => [
        document.key,
        { status: status === "approved" ? "approved" : status === "rejected" ? "rejected" : document.status },
      ]),
    )
    try {
      await apiRequest(`/admin/professional-reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reviewerNote: notes[review.id] ?? "",
          checklist: review.checklist,
          documentDecisions,
        }),
      })
      setMessage(`Review ${status}`)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update review")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Professional account reviews</h2>
          <p className="text-sm text-muted-foreground">Review specialist, veterinary and seller documents one by one.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCcw className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>
      {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}
      {items.length === 0 && !loading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No professional review packages submitted.</CardContent></Card>
      ) : null}
      {items.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{review.role.replace(/([A-Z])/g, " $1")}</CardTitle>
                <CardDescription>User {review.userId}</CardDescription>
              </div>
              <Badge variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"}>
                {review.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {review.documents.map((document) => (
                <a key={document.key} href={document.url} target="_blank" rel="noreferrer" className="rounded-2xl border bg-background/40 p-4 transition hover:bg-background/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{document.label}</p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">{document.url}</p>
                    </div>
                    {document.status === "approved" ? <FileCheck2 className="size-5 text-emerald-600" /> : document.status === "rejected" ? <XCircle className="size-5 text-destructive" /> : <LoaderCircle className="size-5 text-amber-600" />}
                  </div>
                </a>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(review.checklist).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <Checkbox checked={checked} disabled />
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                </label>
              ))}
            </div>
            <Textarea
              value={notes[review.id] ?? review.reviewerNote ?? ""}
              onChange={(event) => setNotes((current) => ({ ...current, [review.id]: event.target.value }))}
              placeholder="Reviewer notes and missing requirements"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void decide(review, "inReview")}>Mark in review</Button>
              <Button variant="destructive" onClick={() => void decide(review, "rejected")}><XCircle /> Reject</Button>
              <Button onClick={() => void decide(review, "approved")}><BadgeCheck /> Approve</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type UploadFileState = {
  file: File
  checksum: string
  status: "waiting" | "uploading" | "uploaded" | "failed" | "duplicate"
  progress: number
  objectKey?: string
  error?: string
}

export function ImageProfilesPanel() {
  const [profiles, setProfiles] = React.useState<ImageProfile[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [files, setFiles] = React.useState<UploadFileState[]>([])
  const [message, setMessage] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [form, setForm] = React.useState({ code: "", name: "", cropCode: "", diseaseCode: "", description: "" })

  const load = React.useCallback(async () => {
    const response = await apiRequest<ApiEnvelope<ImageProfile[]>>("/admin/image-profiles")
    setProfiles(response.data)
    setSelectedId((current) => current ?? response.data[0]?.id ?? null)
  }, [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load profiles")), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const selected = profiles.find((profile) => profile.id === selectedId)

  async function createProfile(event: React.FormEvent) {
    event.preventDefault()
    setCreating(true)
    try {
      const response = await apiRequest<ApiEnvelope<ImageProfile>>("/admin/image-profiles", {
        method: "POST",
        body: JSON.stringify(form),
      })
      setSelectedId(response.data.id)
      setForm({ code: "", name: "", cropCode: "", diseaseCode: "", description: "" })
      await load()
      setMessage("Image profile created")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create profile")
    } finally {
      setCreating(false)
    }
  }

  async function chooseFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? [])
    if (chosen.length < 10 || chosen.length > 500) {
      setMessage("Choose between 10 and 500 images in one batch")
      return
    }
    const hashed = await Promise.all(
      chosen.map(async (file): Promise<UploadFileState> => ({
        file,
        checksum: await checksum(file),
        status: "waiting",
        progress: 0,
      })),
    )
    const seen = new Set<string>()
    setFiles(
      hashed.map((item) => {
        if (seen.has(item.checksum)) return { ...item, status: "duplicate" as const }
        seen.add(item.checksum)
        return item
      }),
    )
  }

  async function uploadBatch() {
    if (!selectedId) return
    const candidates = files.filter(
      (item) => item.status === "waiting" || item.status === "failed",
    )
    const alreadyUploaded = files.filter(
      (item) => item.status === "uploaded" && item.objectKey,
    )
    if (candidates.length + alreadyUploaded.length < 10) {
      setMessage("At least 10 non-duplicate files are required")
      return
    }

    const completed: UploadFileState[] = [...alreadyUploaded]
    for (const candidate of candidates) {
      setFiles((current) =>
        current.map((item) =>
          item.checksum === candidate.checksum
            ? { ...item, status: "uploading", progress: 10, error: undefined }
            : item,
        ),
      )
      try {
        const presign = await apiRequest<
          ApiEnvelope<{ objectKey: string; uploadUrl: string }>
        >(`/admin/image-profiles/${selectedId}/presign`, {
          method: "POST",
          body: JSON.stringify({
            fileName: candidate.file.name,
            contentType: candidate.file.type || "image/jpeg",
            sizeBytes: candidate.file.size,
          }),
        })
        setFiles((current) =>
          current.map((item) =>
            item.checksum === candidate.checksum
              ? { ...item, progress: 35 }
              : item,
          ),
        )
        const upload = await fetch(presign.data.uploadUrl, {
          method: "PUT",
          headers: {
            "content-type": candidate.file.type || "image/jpeg",
          },
          body: candidate.file,
        })
        if (!upload.ok) {
          throw new Error(`Upload failed with status ${upload.status}`)
        }
        const uploadedItem: UploadFileState = {
          ...candidate,
          status: "uploaded",
          progress: 100,
          objectKey: presign.data.objectKey,
        }
        completed.push(uploadedItem)
        setFiles((current) =>
          current.map((item) =>
            item.checksum === candidate.checksum ? uploadedItem : item,
          ),
        )
      } catch (error) {
        setFiles((current) =>
          current.map((item) =>
            item.checksum === candidate.checksum
              ? {
                  ...item,
                  status: "failed",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : item,
          ),
        )
      }
    }

    const uniqueUploaded = Array.from(
      new Map(
        completed
          .filter((item) => item.objectKey)
          .map((item) => [item.checksum, item]),
      ).values(),
    )
    if (uniqueUploaded.length < 10) {
      setMessage("Fewer than 10 files uploaded successfully. Retry failed files.")
      return
    }

    await apiRequest(`/admin/image-profiles/${selectedId}/items/bulk`, {
      method: "POST",
      body: JSON.stringify({
        items: uniqueUploaded.map((item) => ({
          objectKey: item.objectKey,
          originalName: item.file.name,
          contentType: item.file.type || "image/jpeg",
          sizeBytes: item.file.size,
          checksum: item.checksum,
        })),
      }),
    })
    setMessage("Batch uploaded and queued for quality processing")
    await load()
  }

  async function action(path: string) {
    if (!selectedId) return
    try {
      await apiRequest(`/admin/image-profiles/${selectedId}/${path}`, {
        method: "POST",
        body: JSON.stringify(path === "reindex" ? { force: true } : {}),
      })
      await load()
      setMessage(`Profile ${path} request completed`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed")
    }
  }

  async function reviewItem(
    itemId: string,
    status: "ready" | "rejected",
  ) {
    if (!selectedId) return
    try {
      await apiRequest(
        `/admin/image-profiles/${selectedId}/items/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            qualityScore: status === "ready" ? 1 : 0,
            error: status === "rejected" ? "Rejected during quality review" : undefined,
          }),
        },
      )
      await load()
      setMessage(`Image marked ${status}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not review image")
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Create image profile</CardTitle><CardDescription>Define the disease/crop profile before uploading 10â€“500 training images.</CardDescription></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={createProfile}>
              <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Crop code</Label><Input value={form.cropCode} onChange={(e) => setForm({ ...form, cropCode: e.target.value })} /></div>
              <div><Label>Disease code</Label><Input value={form.diseaseCode} onChange={(e) => setForm({ ...form, diseaseCode: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button className="w-full" disabled={creating}>{creating ? <LoaderCircle className="animate-spin" /> : <ImagePlus />} Create profile</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Profiles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {profiles.map((profile) => (
              <button key={profile.id} type="button" onClick={() => setSelectedId(profile.id)} className={`w-full rounded-xl border p-3 text-left ${profile.id === selectedId ? "bg-primary/10 ring-1 ring-primary" : "bg-background/40"}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{profile.name}</span><Badge variant="outline">{profile.status}</Badge></div>
                <p className="mt-1 text-xs text-muted-foreground">{profile.readyCount} ready Â· {profile.duplicateCount} duplicate Â· {profile.failedCount} failed</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}
        {!selected ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">Create or select an image profile.</CardContent></Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><CardTitle>{selected.name}</CardTitle><CardDescription>{selected.code} Â· version {selected.version}</CardDescription></div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void action("reindex")}><RotateCcw /> Re-index</Button>
                    <Button variant="outline" onClick={() => void action("archive")}><Archive /> Archive</Button>
                    <Button onClick={() => void action("activate")}><Play /> Activate</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                <Metric label="Images" value={selected.items.length} />
                <Metric label="Ready" value={selected.readyCount} />
                <Metric label="Duplicates" value={selected.duplicateCount} />
                <Metric label="Failed" value={selected.failedCount} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Bulk image uploader</CardTitle><CardDescription>Select 10â€“500 images. Checksums flag duplicates before upload; failed files can be retried.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Input type="file" accept="image/*" multiple onChange={(event) => void chooseFiles(event)} />
                <div className="max-h-[420px] space-y-2 overflow-y-auto">
                  {files.map((item) => (
                    <div key={`${item.file.name}-${item.checksum}`} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0"><p className="truncate text-sm font-medium">{item.file.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(item.file.size / 1024)} KB Â· {item.status}</p></div>
                        <Badge variant={item.status === "failed" ? "destructive" : item.status === "uploaded" ? "default" : "outline"}>{item.progress}%</Badge>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${item.progress}%` }} /></div>
                      {item.error ? <p className="mt-2 text-xs text-destructive">{item.error}</p> : null}
                    </div>
                  ))}
                </div>
                <Button onClick={() => void uploadBatch()} disabled={!selectedId || files.length < 10}><UploadCloud /> Upload and process batch</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Quality review</CardTitle><CardDescription>Processed item state, duplicate reporting and evaluation readiness.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {selected.items.length === 0 ? <p className="text-sm text-muted-foreground">No registered images yet.</p> : selected.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        Quality {item.qualityScore == null ? "pending" : `${Math.round(item.qualityScore * 100)}%`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.status === "ready" ? "default" : item.status === "failed" || item.status === "rejected" ? "destructive" : "outline"}>{item.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => void reviewItem(item.id, "rejected")}>Reject</Button>
                      <Button size="sm" onClick={() => void reviewItem(item.id, "ready")}>Approve</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>
}

async function checksum(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")
}


