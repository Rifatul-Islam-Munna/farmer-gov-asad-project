export type UserRole = 'admin' | 'agent' | 'farmer' | 'buyer' | 'medicineSeller';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface AppUser {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  businessName?: string;
  shopName?: string;
  address?: string;
  createdAt: string;
}

export interface Listing {
  _id: string;
  ownerId: string;
  goodCode: string;
  goodName: string;
  quantity: number;
  unit: string;
  marketPrice: number;
  governmentPrice: number;
  minimumPrice: number;
  status: string;
  address?: string;
  createdAt: string;
}

export interface Deal {
  _id: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  createdAt: string;
}

export interface ReportItem {
  _id: string;
  reporterId: string;
  targetType: string;
  targetId?: string;
  subject: string;
  description: string;
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  adminNote?: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface DashboardResponse {
  data: {
    metrics: Record<string, number>;
    roleBreakdown: Record<string, number>;
    verificationBreakdown: Record<string, number>;
    listingBreakdown: Record<string, number>;
    dealBreakdown: Record<string, number>;
    recentUsers: AppUser[];
    recentListings: Listing[];
  };
}
