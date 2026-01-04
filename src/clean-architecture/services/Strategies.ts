import { User, Coupon } from '../entities/types';
import { CouponFactory } from './CouponFactory';

export interface ICouponStrategy {
    generate(user: User, daysSinceLastPurchase: number): Coupon[];
}

export class RegularStrategy implements ICouponStrategy {
    generate(user: User, daysSinceLastPurchase: number): Coupon[] {
        const coupons: Coupon[] = [];
        // Logique EXACTE du Legacy
        if (user.totalPurchases >= 3) coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 10, 50));
        if (user.totalSpent > 100) coupons.push(CouponFactory.create(user.id, 'FIXED_AMOUNT', 15, 100));
        if (daysSinceLastPurchase > 30) coupons.push(CouponFactory.create(user.id, 'FREE_SHIPPING', 0));
        return coupons;
    }
}

export class PremiumStrategy implements ICouponStrategy {
    generate(user: User, daysSinceLastPurchase: number): Coupon[] {
        const coupons: Coupon[] = [];
        // Logique EXACTE du Legacy
        coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 15, 100));
        if (user.totalPurchases >= 10) coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 20, 150));
        if (user.totalSpent > 500) coupons.push(CouponFactory.create(user.id, 'FIXED_AMOUNT', 50, 200));
        coupons.push(CouponFactory.create(user.id, 'FREE_SHIPPING', 0));
        
        if (user.favoriteCategories.includes('ELECTRONICS')) {
            // Note: Simplification ici pour la Factory, ou ajout d'une méthode spécifique
            coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 25, 200)); 
        }
        return coupons;
    }
}

export class VipStrategy implements ICouponStrategy {
    generate(user: User, daysSinceLastPurchase: number): Coupon[] {
        const coupons: Coupon[] = [];
        // Logique EXACTE du Legacy (VIP a beaucoup de règles)
        coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 25, 200));
        coupons.push(CouponFactory.create(user.id, 'FIXED_AMOUNT', 100, 500));
        coupons.push(CouponFactory.create(user.id, 'FREE_SHIPPING', 0));
        coupons.push(CouponFactory.create(user.id, 'BUY_ONE_GET_ONE', 0, 100));

        if (user.totalSpent > 2000) coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 30, 500));
        
        // Logique d'âge et localisation (récupérées du legacy)
        if (user.age && user.age > 40) coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 20, 100));
        if (user.location === 'Nice') coupons.push(CouponFactory.create(user.id, 'PERCENTAGE', 15, 100));
        
        return coupons;
    }
}