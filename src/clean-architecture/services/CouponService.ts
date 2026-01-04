import { IUserRepository, ICouponRepository, IPurchaseRepository } from '../repositories/IRepository';
import { INotificationService } from '../infrastructure/NotificationService';
import { ILogger } from '../infrastructure/LoggerService';
import { ICouponStrategy, RegularStrategy, PremiumStrategy, VipStrategy } from './Strategies';
import { Coupon } from '../entities/types';

export class CouponService {
    private strategies: Map<string, ICouponStrategy>;

    constructor(
        private userRepo: IUserRepository,
        private couponRepo: ICouponRepository,
        private purchaseRepo: IPurchaseRepository,
        private notificationService: INotificationService,
        private logger: ILogger
    ) {
        this.strategies = new Map();
        this.strategies.set('REGULAR', new RegularStrategy());
        this.strategies.set('PREMIUM', new PremiumStrategy());
        this.strategies.set('VIP', new VipStrategy());
    }

    // --- USE CASE 1 : GENERATION ---
    async generateCouponsForUser(userId: string): Promise<Coupon[]> {
        const user = await this.userRepo.findById(userId);
        
        // Validation (Logique Legacy conservée)
        if (!user || !user.isActive) {
            this.logger.log('ERROR', `User ${userId} not found or inactive`);
            throw new Error('Utilisateur invalide');
        }

        // Calcul données requises (Logique Legacy déplacée mais conservée)
        const purchases = await this.purchaseRepo.findByUserId(userId);
        const lastPurchaseTime = user.lastPurchaseDate ? new Date(user.lastPurchaseDate).getTime() : 0;
        const daysSinceLastPurchase = lastPurchaseTime ? Math.floor((Date.now() - lastPurchaseTime) / (86400000)) : 999;

        // Stratégie
        const strategy = this.strategies.get(user.profile);
        if (!strategy) throw new Error('Profil inconnu');
        
        const coupons = strategy.generate(user, daysSinceLastPurchase);

        // Persistance
        for (const c of coupons) {
            await this.couponRepo.save(c);
        }

        // Notification (via service infrastructure)
        this.notificationService.sendCouponGeneratedEmail(user.email, coupons.map(c => c.code));
        this.logger.log('INFO', `${coupons.length} coupons générés pour ${userId}`);

        return coupons;
    }

    // --- USE CASE 2 : VALIDATION ---
    async validateAndUseCoupon(code: string, userId: string, amount: number): Promise<boolean> {
        const userCoupons = await this.couponRepo.findByUserId(userId);
        const coupon = userCoupons.find(c => c.code === code);

        // Logique de validation stricte du Legacy
        if (!coupon) return false;
        if (coupon.isUsed) return false;
        if (new Date() > new Date(coupon.validUntil)) return false;
        if (amount < coupon.minOrderAmount) return false;

        coupon.isUsed = true;
        coupon.currentUsage = (coupon.currentUsage || 0) + 1;
        await this.couponRepo.save(coupon);
        
        this.logger.log('INFO', `Coupon ${code} utilisé par ${userId}`);
        return true;
    }

    // --- USE CASE 3 : STATISTIQUES ---
    async getStatistics(): Promise<any> {
        // On récupère tout pour recalculer les stats du Legacy
        const users = await this.userRepo.findAll();
        const coupons = await this.couponRepo.findAll();
        
        // Reproduction des calculs du legacy service
        const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
        
        return {
            users: {
                total: users.length,
                active: users.filter(u => u.isActive).length
            },
            coupons: {
                total: coupons.length,
                used: coupons.filter(c => c.isUsed).length
            },
            revenue: {
                total: totalRevenue
            }
        };
    }
}