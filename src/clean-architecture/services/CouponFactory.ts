import { Coupon } from '../entities/types';
import * as crypto from 'crypto';

export class CouponFactory {
    static create(
        userId: string, 
        type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE', 
        value: number, 
        minOrder: number = 0
    ): Coupon {
        return {
            id: crypto.randomUUID(),
            code: 'CLEAN' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            discountType: type,
            discountValue: value,
            minOrderAmount: minOrder,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            createdAt: new Date().toISOString()
        };
    }
}