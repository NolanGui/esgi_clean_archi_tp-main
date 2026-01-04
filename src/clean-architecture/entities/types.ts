export interface User {
    id: string;
    email: string;
    profile: 'REGULAR' | 'PREMIUM' | 'VIP';
    firstName: string;
    lastName: string;
    totalPurchases: number;
    totalSpent: number;
    location?: string;
    age?: number;
    isActive: boolean;
    lastPurchaseDate?: string;
    favoriteCategories: string[];
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE';
    discountValue: number;
    minOrderAmount: number;
    validFrom: string;
    validUntil: string;
    userId: string;
    isUsed: boolean;
    createdAt: string;
    usageLimit?: number;
    currentUsage: number;
}

export interface PurchaseHistory {
    userId: string;
    amount: number;
    date: string;
}

// --- DTOs (Data Transfer Objects) pour le Controller ---
export interface CouponRequest {
    userId: string;
    userProfile?: string;
    ipAddress?: string; // Pour la sécurité
    userAgent?: string; // Pour la sécurité
    sessionId?: string; // Pour la session
}

export interface CouponResponse {
    success: boolean;
    coupons?: Coupon[];
    error?: string;
    message?: string;
    processingTime?: number;
    requestId?: string;
    systemStatus?: any; // Pour récupérer les stats système
}