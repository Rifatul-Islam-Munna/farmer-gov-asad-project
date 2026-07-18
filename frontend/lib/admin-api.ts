export const API_URL = "/api/backend"

export type ApiEnvelope<T> = { data: T; message?: string }

export type UserRole =
  | "farmer"
  | "wholesaleBuyer"
  | "buyer"
  | "studentVolunteer"
  | "agent"
  | "agricultureSpecialist"
  | "veterinaryDoctor"
  | "seller"
  | "machinerySeller"
  | "medicineSeller"
  | "publicUser"
  | "governmentOfficer"
  | "support"
  | "admin"
  | "superAdmin"

export type AdminUser = {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  role: UserRole
  roles?: UserRole[]
  accountStatus?: "active" | "suspended" | "deleted"
  verificationStatus: "pending" | "approved" | "rejected"
  address?: string
  businessName?: string
  shopName?: string
  landAmount?: number
  createdAt?: string
}

export type Listing = {
  _id: string
  ownerId: string
  goodCode: string
  goodName: string
  quantity: number
  reservedQuantity?: number
  unit: string
  minimumPrice: number
  marketPrice: number
  governmentPrice: number
  status: string
  address?: string
  createdAt?: string
}

export type Deal = {
  _id: string
  buyerId: string
  farmerId: string
  listingId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: "confirmed" | "completed" | "cancelled" | "disputed"
  confirmedAt?: string
}

export type MarketPrice = {
  _id: string
  goodCode: string
  goodName: string
  unit: string
  governmentPrice: number
  marketPrice: number
  previousMarketPrice: number
  region: string
  marketName: string
  priceDate: string
}

export type Good = {
  _id: string
  code: string
  name: string
  localName?: string
  categoryCode: string
  defaultUnit: string
  active: boolean
}

export type GoodsPayload = {
  goods: Good[]
  categories: Array<{ _id: string; code: string; name: string; active: boolean }>
}

export type InventoryItem = {
  _id: string
  sellerId: string
  medicineCode: string
  medicineName: string
  type: string
  stockQuantity: number
  unit: string
  price: number
  shopName: string
  address: string
  active: boolean
}

export type DashboardData = {
  metrics: {
    totalUsers: number
    pendingUsers: number
    totalListings: number
    activeListings: number
    totalDeals: number
    dealVolume: number
    inventoryItems: number
  }
  usersByRole: Array<{ role: string; value: number }>
  activityTrend: Array<{
    month: string
    deals: number
    listings: number
    volume: number
  }>
  recentDeals: Deal[]
  recentListings: Listing[]
}

export function getCsrfToken() {
  if (typeof document === "undefined") return undefined
  const raw = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("agrivision_csrf="))
    ?.split("=")[1]
  return raw ? decodeURIComponent(raw) : undefined
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  legacyToken?: string,
): Promise<T> {
  void legacyToken
  const method = (options.method ?? "GET").toUpperCase()
  const csrfToken =
    typeof document === "undefined"
      ? undefined
      : document.cookie
          .split("; ")
          .find((entry) => entry.startsWith("agrivision_csrf="))
          ?.split("=")[1]
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(method !== "GET" && method !== "HEAD" && csrfToken
        ? { "x-csrf-token": decodeURIComponent(csrfToken) }
        : {}),
      ...options.headers,
    },
    cache: "no-store",
  })

  const body = (await response.json().catch(() => ({}))) as {
    message?: string | string[]
  }
  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message
    throw new Error(message || `Request failed with status ${response.status}`)
  }
  return body as T
}
