export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000"

export type ApiEnvelope<T> = { data: T; message?: string }

export type VerificationStatus = "pending" | "approved" | "rejected"
export type UserRole =
  | "admin"
  | "agent"
  | "farmer"
  | "buyer"
  | "medicineSeller"

export type AdminUser = {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  role: UserRole
  verificationStatus: VerificationStatus
  address?: string
  businessName?: string
  shopName?: string
  landAmount?: number
  gender?: string
  documents?: string[]
  location?: {
    latitude?: number
    longitude?: number
    updatedAt?: string
  }
  createdAt?: string
  updatedAt?: string
}

export type ListingStatus =
  | "draft"
  | "pendingOtp"
  | "published"
  | "reserved"
  | "sold"
  | "expired"
  | "cancelled"
  | "rejected"

export type Listing = {
  _id: string
  ownerId: string
  assistingAgentId?: string
  goodCode: string
  goodName: string
  imageUrls?: string[]
  quantity: number
  reservedQuantity?: number
  unit: string
  grade?: string
  harvestDate?: string
  address?: string
  latitude?: number
  longitude?: number
  governmentPrice: number
  marketPrice: number
  minimumPrice: number
  status: ListingStatus
  publishedAt?: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
}

export type OfferStatus =
  | "pending"
  | "countered"
  | "acceptedByBuyer"
  | "acceptedByFarmer"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "expired"

export type Offer = {
  _id: string
  listingId: string
  buyerId: string
  farmerId: string
  quantity: number
  unitPrice: number
  status: OfferStatus
  buyerAccepted: boolean
  farmerAccepted: boolean
  history?: Array<{
    byUserId: string
    quantity: number
    unitPrice: number
    createdAt: string
  }>
  expiresAt?: string
  confirmedAt?: string
  createdAt?: string
}

export type DealStatus =
  | "confirmed"
  | "completed"
  | "cancelled"
  | "disputed"

export type Deal = {
  _id: string
  offerId: string
  buyerId: string
  farmerId: string
  listingId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: DealStatus
  confirmedAt?: string
  createdAt?: string
  updatedAt?: string
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
  imageUrl?: string
  priceDate: string
  createdAt?: string
  updatedAt?: string
}

export type Good = {
  _id: string
  code: string
  name: string
  localName?: string
  categoryCode: string
  defaultUnit: string
  imageUrl?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export type GoodsCategory = {
  _id: string
  code: string
  name: string
  localName?: string
  icon?: string
  active: boolean
}

export type GoodsPayload = {
  goods: Good[]
  categories: GoodsCategory[]
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
  latitude: number
  longitude: number
  active: boolean
  createdAt?: string
  updatedAt?: string
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

export type AdminDataSnapshot = {
  dashboard: DashboardData | null
  users: AdminUser[]
  listings: Listing[]
  offers: Offer[]
  deals: Deal[]
  prices: MarketPrice[]
  goods: Good[]
  categories: GoodsCategory[]
  inventory: InventoryItem[]
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}`, access_token: token }
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
