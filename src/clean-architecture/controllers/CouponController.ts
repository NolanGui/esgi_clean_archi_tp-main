import { CouponService } from '../services/CouponService';
import { JsonUserRepository, JsonCouponRepository, JsonPurchaseRepository } from '../repositories/JsonRepository';
import { MockEmailService } from '../infrastructure/NotificationService';
import { ConsoleLogger } from '../infrastructure/LoggerService';
import { CouponRequest, CouponResponse } from '../entities/types';

export class CouponController {
    public couponService: CouponService;
    
    // Legacy properties: Rate Limiting & Security
    private rateLimiter: Map<string, number> = new Map();
    private maintenanceMode: boolean = false;

    constructor() {
        // Injection de Dépendances (Composition Root)
        const userRepo = new JsonUserRepository();
        const couponRepo = new JsonCouponRepository();
        const purchaseRepo = new JsonPurchaseRepository();
        const emailService = new MockEmailService();
        const logger = new ConsoleLogger();

        this.couponService = new CouponService(
            userRepo, 
            couponRepo, 
            purchaseRepo, 
            emailService, 
            logger
        );
    }

    async generateCoupons(request: CouponRequest): Promise<CouponResponse> {
        const startTime = Date.now();
        const requestId = `REQ_${startTime}`;

        try {
            // 1. Feature Legacy : Maintenance Mode
            if (this.maintenanceMode) {
                return { success: false, error: 'Maintenance Mode' };
            }

            // 2. Feature Legacy : Rate Limiting (Simplifié)
            if (this.isRateLimited(request.userId)) {
                return { success: false, error: 'Rate limit exceeded' };
            }

            // 3. Feature Legacy : Security Checks
            if (this.isBlockedIP(request.ipAddress)) {
                return { success: false, error: 'Security Violation' };
            }

            // Appel Service Métier
            const coupons = await this.couponService.generateCouponsForUser(request.userId);

            return {
                success: true,
                coupons: coupons,
                message: `${coupons.length} coupons générés avec succès`,
                processingTime: Date.now() - startTime,
                requestId: requestId
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                requestId: requestId
            };
        }
    }

    // --- Méthodes privées réintégrant la logique Legacy du Controller ---

    private isRateLimited(userId: string): boolean {
        const count = this.rateLimiter.get(userId) || 0;
        if (count > 10) return true;
        this.rateLimiter.set(userId, count + 1);
        return false;
    }

    private isBlockedIP(ip?: string): boolean {
        if (!ip) return false;
        return ['192.168.1.100', '10.0.0.1'].includes(ip);
    }

    async getSystemStatus(): Promise<any> {
        // Feature Legacy
        return {
            maintenanceMode: this.maintenanceMode,
            activeUsers: this.rateLimiter.size,
            uptime: process.uptime()
        };
    }
}