// QUESTIONS POUR IDENTIFIER LES PROBLÈMES D'ARCHITECTURE
// 1. Que pensez-vous de cette classe Controller ?
// 2. Quelles sont les différentes responsabilités que vous identifiez ?
// 3. Comment cette classe viole-t-elle les principes SOLID ?
// 4. Quels sont les problèmes de couplage et de dépendances ?
// 5. Comment pourriez-vous améliorer cette architecture ?

import { CouponService } from './CouponService'
import * as fs from 'fs'
import * as path from 'path'

// VIOLATION SRP: Interface qui mélange trop de responsabilités
interface CouponRequest {
    userId: string
    userProfile?: 'REGULAR' | 'PREMIUM' | 'VIP'
    userEmail?: string
    userFirstName?: string
    userLastName?: string
    userAge?: number
    userLocation?: string
    totalPurchases?: number
    totalSpent?: number
    favoriteCategories?: string[]
    forceGeneration?: boolean
    adminOverride?: boolean
    requestSource?: 'WEB' | 'MOBILE' | 'API' | 'ADMIN'
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    timestamp?: string
}

interface CouponResponse {
    success: boolean
    coupons?: any[]
    error?: string
    message?: string
    requestId?: string
    processingTime?: number
    userProfile?: string
    generatedAt?: string
    expiresAt?: string
    usageInstructions?: string
    termsAndConditions?: string
    promotionalMessage?: string
}

interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
}

interface UserAnalytics {
    userId: string
    totalCouponsGenerated: number
    totalCouponsUsed: number
    averageCouponValue: number
    favoriteCouponTypes: string[]
    lastGenerationDate: string
    generationFrequency: number
}

export class CouponController {
    // VIOLATION SRP: Trop de propriétés privées avec des responsabilités différentes
    private couponService: CouponService
    private requestLog: any[] = []
    private userAnalytics: Map<string, UserAnalytics> = new Map()
    private rateLimiter: Map<string, number> = new Map()
    private sessionManager: Map<string, any> = new Map()
    private apiKeys: Map<string, string> = new Map()
    private requestCounter: number = 0
    private errorCounter: number = 0
    private performanceMetrics: any = {}
    private cache: Map<string, any> = new Map()
    private auditLog: any[] = []
    private notificationQueue: any[] = []
    private maintenanceMode: boolean = false

    constructor() {
        // VIOLATION SRP: Le constructeur fait trop de choses
        this.couponService = new CouponService()
        this.setupRateLimiting()
        this.loadConfiguration()
        this.initializeAnalytics()
        this.setupCaching()
        this.loadApiKeys()
        this.startMaintenanceScheduler()
        console.log('✅ CouponController initialisé (mais très mal architecturé!)')
    }

    // VIOLATION SRP: Méthode principale qui fait absolument tout!
    async generateCoupons(request: CouponRequest): Promise<CouponResponse> {
        const startTime = Date.now()
        const requestId = this.generateRequestId()

        try {
            // 1. Validation de la requête
            const validation = this.validateRequest(request)
            if (!validation.isValid) {
                this.logRequest(request, requestId, 'VALIDATION_FAILED', validation.errors)
                return {
                    success: false,
                    error: 'Requête invalide',
                    message: validation.errors.join(', '),
                    requestId
                }
            }

            // 2. Vérification du rate limiting
            if (!this.checkRateLimit(request.userId, request.ipAddress)) {
                this.logRequest(request, requestId, 'RATE_LIMIT_EXCEEDED')
                return {
                    success: false,
                    error: 'Limite de requêtes dépassée',
                    message: 'Trop de requêtes pour cet utilisateur',
                    requestId
                }
            }

            // 3. Vérification de la maintenance
            if (this.maintenanceMode && !request.adminOverride) {
                this.logRequest(request, requestId, 'MAINTENANCE_MODE')
                return {
                    success: false,
                    error: 'Maintenance en cours',
                    message: 'Le système est en maintenance',
                    requestId
                }
            }

            // 4. Gestion de session
            this.manageSession(request.sessionId, request.userId)

            // 5. Vérification de sécurité
            if (!this.validateSecurity(request)) {
                this.logRequest(request, requestId, 'SECURITY_VIOLATION')
                return {
                    success: false,
                    error: 'Violation de sécurité',
                    message: 'Requête suspecte détectée',
                    requestId
                }
            }

            // 6. Mise à jour des analytics utilisateur
            this.updateUserAnalytics(request.userId)

            // 7. Génération des coupons via le service
            const coupons = await this.couponService.generateCouponsForUser(request.userId)

            // 8. Post-traitement des coupons
            const processedCoupons = this.postProcessCoupons(coupons, request)

            // 9. Mise à jour du cache
            this.updateCache(request.userId, processedCoupons)

            // 10. Envoi de notifications
            this.sendNotifications(request, processedCoupons)

            // 11. Logging et audit
            const processingTime = Date.now() - startTime
            this.logRequest(request, requestId, 'SUCCESS', [], processingTime)
            this.auditLog.push({
                requestId,
                userId: request.userId,
                action: 'COUPON_GENERATION',
                timestamp: new Date().toISOString(),
                processingTime,
                couponCount: processedCoupons.length
            })

            // 12. Mise à jour des métriques
            this.updatePerformanceMetrics(processingTime)

            // 13. Génération de la réponse
            const response: CouponResponse = {
                success: true,
                coupons: processedCoupons,
                message: `${processedCoupons.length} coupon(s) généré(s) avec succès`,
                requestId,
                processingTime,
                userProfile: request.userProfile,
                generatedAt: new Date().toISOString(),
                expiresAt: this.calculateExpirationDate(),
                usageInstructions: this.generateUsageInstructions(processedCoupons),
                termsAndConditions: this.getTermsAndConditions(),
                promotionalMessage: this.generatePromotionalMessage(request.userProfile)
            }

            return response

        } catch (error: any) {
            const processingTime = Date.now() - startTime
            this.errorCounter++
            this.logRequest(request, requestId, 'ERROR', [error.message], processingTime)

            return {
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Une erreur est survenue lors de la génération des coupons',
                requestId,
                processingTime
            }
        }
    }

    // VIOLATION SRP: Méthodes utilitaires mélangées avec la logique métier
    private validateRequest(request: CouponRequest): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []
        const suggestions: string[] = []

        // Validation de l'utilisateur
        if (!request.userId) {
            errors.push('ID utilisateur requis')
        }

        if (!request.userEmail && !request.userId) {
            errors.push('Email utilisateur ou ID requis')
        }

        // Validation du profil
        if (request.userProfile && !['REGULAR', 'PREMIUM', 'VIP'].includes(request.userProfile)) {
            errors.push('Profil utilisateur invalide')
        }

        // Validation de l'âge
        if (request.userAge && (request.userAge < 0 || request.userAge > 120)) {
            warnings.push('Âge utilisateur suspect')
        }

        // Validation des montants
        if (request.totalSpent && request.totalSpent < 0) {
            errors.push('Montant total dépensé invalide')
        }

        if (request.totalPurchases && request.totalPurchases < 0) {
            errors.push('Nombre d\'achats invalide')
        }

        // Suggestions basées sur le profil
        if (request.userProfile === 'REGULAR' && request.totalSpent && request.totalSpent > 1000) {
            suggestions.push('Considérez une mise à niveau vers PREMIUM')
        }

        if (request.userProfile === 'PREMIUM' && request.totalSpent && request.totalSpent > 5000) {
            suggestions.push('Considérez une mise à niveau vers VIP')
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        }
    }

    private checkRateLimit(userId: string, ipAddress?: string): boolean {
        const userLimit = this.rateLimiter.get(userId) || 0
        const ipLimit = ipAddress ? (this.rateLimiter.get(ipAddress) || 0) : 0

        if (userLimit >= 10 || ipLimit >= 20) {
            return false
        }

        this.rateLimiter.set(userId, userLimit + 1)
        if (ipAddress) {
            this.rateLimiter.set(ipAddress, ipLimit + 1)
        }

        return true
    }

    private validateSecurity(request: CouponRequest): boolean {
        // Vérifications de sécurité basiques
        if (request.ipAddress && this.isBlockedIP(request.ipAddress)) {
            return false
        }

        if (request.userAgent && this.isSuspiciousUserAgent(request.userAgent)) {
            return false
        }

        if (request.sessionId && !this.isValidSession(request.sessionId)) {
            return false
        }

        return true
    }

    private postProcessCoupons(coupons: any[], request: CouponRequest): any[] {
        return coupons.map(coupon => ({
            ...coupon,
            personalizedMessage: this.generatePersonalizedMessage(coupon, request),
            priority: this.calculateCouponPriority(coupon, request),
            displayOrder: this.calculateDisplayOrder(coupon, request),
            additionalBenefits: this.getAdditionalBenefits(coupon, request)
        }))
    }

    private generatePersonalizedMessage(coupon: any, request: CouponRequest): string {
        const messages: Record<string, string> = {
            'PERCENTAGE': `Réduction de ${coupon.discountValue}% pour ${request.userFirstName || 'vous'}!`,
            'FIXED_AMOUNT': `${coupon.discountValue}€ de réduction spécialement pour vous!`,
            'FREE_SHIPPING': 'Livraison gratuite offerte!',
            'BUY_ONE_GET_ONE': 'Achetez un, obtenez-en un gratuit!'
        }
        return messages[coupon.discountType] || 'Coupon spécial pour vous!'
    }

    private calculateCouponPriority(coupon: any, request: CouponRequest): number {
        let priority = 1

        if (request.userProfile === 'VIP') priority += 3
        else if (request.userProfile === 'PREMIUM') priority += 2
        else if (request.userProfile === 'REGULAR') priority += 1

        if (coupon.discountType === 'PERCENTAGE' && coupon.discountValue > 20) priority += 2
        if (coupon.discountType === 'FIXED_AMOUNT' && coupon.discountValue > 50) priority += 2

        return priority
    }

    private calculateDisplayOrder(coupon: any, request: CouponRequest): number {
        // Logique complexe de tri basée sur plusieurs critères
        return Math.random() * 100 // Simulation d'un calcul complexe
    }

    private getAdditionalBenefits(coupon: any, request: CouponRequest): string[] {
        const benefits: string[] = []

        if (request.userProfile === 'VIP') {
            benefits.push('Support prioritaire')
            benefits.push('Retours gratuits')
        }

        if (coupon.discountType === 'PERCENTAGE' && coupon.discountValue > 25) {
            benefits.push('Livraison express gratuite')
        }

        return benefits
    }

    private generateUsageInstructions(coupons: any[]): string {
        return coupons.map(coupon =>
            `Utilisez le code ${coupon.code} lors de votre commande. ${coupon.minOrderAmount ? `Montant minimum: ${coupon.minOrderAmount}€` : ''}`
        ).join('\n')
    }

    private getTermsAndConditions(): string {
        return 'Les coupons sont valides 30 jours. Non cumulables avec d\'autres offres. Conditions générales applicables.'
    }

    private generatePromotionalMessage(profile?: string): string {
        const messages: Record<string, string> = {
            'REGULAR': 'Merci pour votre fidélité!',
            'PREMIUM': 'Merci d\'être un client Premium!',
            'VIP': 'Merci d\'être un client VIP!'
        }
        return messages[profile || ''] || 'Merci pour votre confiance!'
    }

    private calculateExpirationDate(): string {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }


    private setupRateLimiting(): void {
        // Configuration du rate limiting
        setInterval(() => {
            this.rateLimiter.clear()
        }, 60000) // Reset toutes les minutes
    }

    private loadConfiguration(): void {
        try {
            const configPath = path.join(__dirname, '../../config/app.json')
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
                this.maintenanceMode = config.maintenanceMode || false
            }
        } catch (error) {
            console.error('Failed to load configuration:', error)
        }
    }


    private initializeAnalytics(): void {
        this.performanceMetrics = {
            totalRequests: 0,
            averageResponseTime: 0,
            errorRate: 0,
            successRate: 0
        }
    }

    private setupCaching(): void {
        // Configuration du cache
        setInterval(() => {
            this.cache.clear()
        }, 300000) // Clear cache toutes les 5 minutes
    }

    private loadApiKeys(): void {
        this.apiKeys.set('web-app', 'web-key-123')
        this.apiKeys.set('mobile-app', 'mobile-key-456')
        this.apiKeys.set('admin-panel', 'admin-key-789')
    }

    private startMaintenanceScheduler(): void {
        // Maintenance quotidienne à 2h du matin
        setInterval(() => {
            const now = new Date()
            if (now.getHours() === 2 && now.getMinutes() === 0) {
                this.performMaintenance()
            }
        }, 60000)
    }


    private performMaintenance(): void {
        console.log('Performing system maintenance...')
        this.cache.clear()
        this.rateLimiter.clear()
        this.requestLog = this.requestLog.slice(-1000) // Garder seulement les 1000 dernières requêtes
    }

    private updateUserAnalytics(userId: string): void {
        const analytics = this.userAnalytics.get(userId) || {
            userId,
            totalCouponsGenerated: 0,
            totalCouponsUsed: 0,
            averageCouponValue: 0,
            favoriteCouponTypes: [],
            lastGenerationDate: '',
            generationFrequency: 0
        }

        analytics.totalCouponsGenerated++
        analytics.lastGenerationDate = new Date().toISOString()
        analytics.generationFrequency++

        this.userAnalytics.set(userId, analytics)
    }

    private updateCache(userId: string, coupons: any[]): void {
        this.cache.set(`coupons_${userId}`, {
            coupons,
            timestamp: new Date().toISOString(),
            ttl: 300000 // 5 minutes
        })
    }

    private sendNotifications(request: CouponRequest, coupons: any[]): void {
        this.notificationQueue.push({
            type: 'COUPON_GENERATED',
            userId: request.userId,
            couponCount: coupons.length,
            timestamp: new Date().toISOString()
        })
    }

    private updatePerformanceMetrics(processingTime: number): void {
        this.performanceMetrics.totalRequests++
        this.performanceMetrics.averageResponseTime =
            (this.performanceMetrics.averageResponseTime + processingTime) / 2
        this.performanceMetrics.errorRate = this.errorCounter / this.performanceMetrics.totalRequests
        this.performanceMetrics.successRate = 1 - this.performanceMetrics.errorRate
    }

    private manageSession(sessionId?: string, userId?: string): void {
        if (sessionId && userId) {
            this.sessionManager.set(sessionId, {
                userId,
                lastActivity: new Date().toISOString(),
                requestCount: (this.sessionManager.get(sessionId)?.requestCount || 0) + 1
            })
        }
    }

    private generateRequestId(): string {
        return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private logRequest(request: CouponRequest, requestId: string, status: string, errors: string[] = [], processingTime?: number): void {
        this.requestLog.push({
            requestId,
            userId: request.userId,
            status,
            errors,
            processingTime,
            timestamp: new Date().toISOString(),
            ipAddress: request.ipAddress,
            userAgent: request.userAgent
        })
    }

    private isBlockedIP(ipAddress: string): boolean {
        const blockedIPs = ['192.168.1.100', '10.0.0.1']
        return blockedIPs.includes(ipAddress)
    }

    private isSuspiciousUserAgent(userAgent: string): boolean {
        const suspiciousPatterns = ['bot', 'crawler', 'scraper']
        return suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))
    }

    private isValidSession(sessionId: string): boolean {
        const session = this.sessionManager.get(sessionId)
        if (!session) return false

        const lastActivity = new Date(session.lastActivity)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)

        return diffMinutes < 30 // Session valide 30 minutes
    }

    // VIOLATION SRP: Méthodes utilitaires mélangées avec la logique métier
    async getSystemStatus(): Promise<any> {
        return {
            maintenanceMode: this.maintenanceMode,
            performanceMetrics: this.performanceMetrics,
            cacheSize: this.cache.size,
            activeSessions: this.sessionManager.size,
            requestLogSize: this.requestLog.length,
            errorCount: this.errorCounter,
            uptime: process.uptime()
        }
    }

    async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
        return this.userAnalytics.get(userId) || null
    }

    async getRequestHistory(userId?: string): Promise<any[]> {
        if (userId) {
            return this.requestLog.filter(log => log.userId === userId)
        }
        return this.requestLog.slice(-100) // Dernières 100 requêtes
    }
}
