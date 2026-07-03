export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0))
}

export function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function compactId(value?: string) {
  if (!value) return "—"
  return value.length > 14
    ? `${value.slice(0, 7)}…${value.slice(-5)}`
    : value
}

export function initials(value?: string) {
  const names = value?.trim().split(/\s+/).filter(Boolean) ?? []
  return names.slice(0, 2).map((name) => name[0]?.toUpperCase()).join("") || "A"
}

export function percent(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function exportCsv(
  filename: string,
  rows: Array<Record<string, string | number | boolean | null | undefined>>,
) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    return `"${text.replaceAll('"', '""')}"`
  }
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
