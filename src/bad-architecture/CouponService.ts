// QUESTIONS POUR IDENTIFIER LES PROBLÈMES D'ARCHITECTURE
// 1. Que pensez-vous de l'organisation de cette classe ?
// 2. Quelles sont les différentes responsabilités que vous identifiez ?
// 3. Comment pourriez-vous séparer ces responsabilités ?
// 4. Quels sont les problèmes de testabilité que vous observez ?
// 5. Comment pourriez-vous améliorer la maintenabilité ?
// 6. Quelles violations des principes SOLID pouvez-vous identifier ?
// 7. Comment cette classe viole-t-elle le principe de responsabilité unique ?
// 8. Quels sont les problèmes de couplage et de dépendances ?

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'


interface User {
    id: string
    email: string
    password: string
    firstName: string
    lastName: string
    profile: 'REGULAR' | 'PREMIUM' | 'VIP'
    isActive: boolean
    createdAt: string
    lastLogin?: string
    totalPurchases: number
    totalSpent: number
    lastPurchaseDate?: string
    favoriteCategories: string[]
    age?: number
    location?: string
}

interface Coupon {
    id: string
    code: string
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE'
    discountValue: number
    minOrderAmount?: number
    maxDiscountAmount?: number
    validFrom: string
    validUntil: string
    applicableCategories?: string[]
    userId?: string
    isUsed: boolean
    usageLimit?: number
    currentUsage: number
    createdAt: string
}

interface PurchaseHistory {
    userId: string
    orderId: string
    amount: number
    category: string
    date: string
    productCount: number
}

interface EmailTemplate {
    type: 'WELCOME' | 'COUPON_GENERATED' | 'PROMOTION' | 'REMINDER'
    subject: string
    body: string
    htmlBody?: string
}

interface DatabaseConfig {
    host: string
    port: number
    username: string
    password: string
    database: string
}

interface CacheConfig {
    redisUrl: string
    ttl: number
    maxSize: number
}

interface LogEntry {
    timestamp: string
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
    message: string
    userId?: string
    action: string
    metadata?: any
}

export class CouponService {
    private users: User[] = []
    private coupons: Coupon[] = []
    private purchaseHistory: PurchaseHistory[] = []
    private emailTemplates: EmailTemplate[] = []
    private logs: LogEntry[] = []
    private analyticsData: any = {}
    private notificationQueue: any[] = []
    private couponUsageStats: Map<string, number> = new Map()
    private emailQueue: any[] = []
    private auditTrail: any[] = []
    private performanceMetrics: any = {}
    private errorCount: number = 0

    constructor() {
        this.loadEmailTemplates()
        this.loadUsers()
        this.loadPurchaseHistory()
        this.initializeAnalytics()
        console.log('✅ MonolithicService initialisé avec succès (mais très mal architecturé!)')
    }

    private loadUsers(): void {
        try {
            const usersPath = path.join(__dirname, '../../data/users.json')
            if (fs.existsSync(usersPath)) {
                const data = fs.readFileSync(usersPath, 'utf8')
                this.users = JSON.parse(data)
                this.log('INFO', `Loaded ${this.users.length} users from file`, 'DATA_LOAD')
            } else {
                this.log('INFO', 'No existing users file found, created sample users', 'DATA_LOAD')
            }
        } catch (error) {
            this.log('ERROR', 'Failed to load users', 'DATA_LOAD_ERROR', { error })
        }
    }

    private loadPurchaseHistory(): void {
        try {
            const purchasesPath = path.join(__dirname, '../../data/purchases.json')
            if (fs.existsSync(purchasesPath)) {
                const data = fs.readFileSync(purchasesPath, 'utf8')
                this.purchaseHistory = JSON.parse(data)
                this.log('INFO', `Loaded ${this.purchaseHistory.length} purchase records from file`, 'DATA_LOAD')
            } else {
                this.purchaseHistory = []
                this.log('INFO', 'No existing purchase history file found, starting with empty array', 'DATA_LOAD')
            }
        } catch (error) {
            this.log('ERROR', 'Failed to load purchase history', 'DATA_LOAD_ERROR', { error })
            this.purchaseHistory = []
        }
    }


    private initializeAnalytics(): void {
        this.analyticsData = {
            totalCouponsGenerated: 0,
            totalUsers: 0,
            conversionRate: 0,
            averageDiscountValue: 0
        }
        this.log('INFO', 'Analytics initialized', 'ANALYTICS_INIT')
    }

    private loadEmailTemplates(): void {
        this.emailTemplates = [
            {
                type: 'WELCOME',
                subject: 'Bienvenue chez nous!',
                body: 'Merci de vous être inscrit!',
                htmlBody: '<h1>Bienvenue!</h1><p>Merci de vous être inscrit!</p>'
            },
            {
                type: 'COUPON_GENERATED',
                subject: 'Votre coupon de réduction est prêt!',
                body: 'Voici votre coupon: {couponCode}',
                htmlBody: '<h1>Votre coupon!</h1><p>Code: <strong>{couponCode}</strong></p>'
            },
            {
                type: 'PROMOTION',
                subject: 'Offre spéciale pour vous!',
                body: 'Découvrez nos nouvelles offres!',
                htmlBody: '<h1>Offres spéciales!</h1><p>Découvrez nos nouvelles offres!</p>'
            },
            {
                type: 'REMINDER',
                subject: 'N\'oubliez pas votre coupon!',
                body: 'Votre coupon expire bientôt!',
                htmlBody: '<h1>Rappel!</h1><p>Votre coupon expire bientôt!</p>'
            }
        ]
        this.log('INFO', 'Email templates loaded', 'EMAIL_TEMPLATES_LOAD')
    }



    private updateAnalytics(): void {
        this.analyticsData.totalUsers = this.users.length
        this.analyticsData.totalCouponsGenerated = this.coupons.length
        this.log('INFO', 'Analytics updated', 'ANALYTICS_UPDATE')
    }

    private calculateStatistics(): void {
        const totalSpent = this.users.reduce((sum, user) => sum + user.totalSpent, 0)
        const totalPurchases = this.users.reduce((sum, user) => sum + user.totalPurchases, 0)
        this.analyticsData.averageDiscountValue = totalSpent / totalPurchases
        this.log('INFO', 'Statistics calculated', 'STATS_CALCULATION')
    }


    private log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, action: string, metadata?: any, userId?: string): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            action,
            metadata,
            userId
        }

        this.logs.push(logEntry)

        // Sauvegarde dans fichier
        this.saveLogs()

        // Envoi vers système externe (simulation)
        this.sendToExternalLogging(logEntry)

        // Mise à jour des métriques
        this.updateLogMetrics(level)

        console.log(`[${level}] ${message}`)
    }

    private saveLogs(): void {
        try {
            const logsPath = path.join(__dirname, '../../data/logs.json')
            fs.writeFileSync(logsPath, JSON.stringify(this.logs, null, 2))
        } catch (error) {
            console.error('Failed to save logs:', error)
        }
    }

    private sendToExternalLogging(logEntry: LogEntry): void {
        // Simulation d'envoi vers système externe
        this.notificationQueue.push({
            type: 'LOG',
            data: logEntry,
            timestamp: new Date().toISOString()
        })
    }

    private updateLogMetrics(level: string): void {
        this.performanceMetrics.requestCount++
        if (level === 'ERROR') {
            this.errorCount++
        }
    }

    private generateCouponCode(): string {
        return 'COUPON' + Math.random().toString(36).substr(2, 8).toUpperCase()
    }

    private sendEmail(to: string, subject: string, body: string): void {
        console.log(`📧 Email envoyé à ${to}`)
        console.log(`📧 Sujet: ${subject}`)
        console.log(`📧 Corps: ${body}`)

        // Ajout à la queue d'emails
        this.emailQueue.push({
            to,
            subject,
            body,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        })
    }

    // ===== USE CASE PRINCIPAL: Générer des coupons de réduction =====
    // VIOLATION MASSIVE SRP: Cette méthode fait absolument tout!
    async generateCouponsForUser(userId: string): Promise<Coupon[]> {
        // QUESTION: Que pensez-vous de cette méthode ? Quelles responsabilités identifiez-vous ?

        // 1. Validation de l'utilisateur
        const user = this.users.find(u => u.id === userId && u.isActive)
        if (!user) {
            this.log('ERROR', `User ${userId} not found or inactive`, 'COUPON_GENERATION_ERROR', { userId })
            throw new Error('Utilisateur non trouvé ou inactif')
        }


        // 2. Calcul des statistiques d'achat des utilisateurs
        const userPurchases = this.purchaseHistory.filter(p => p.userId === userId)
        const totalSpent = userPurchases.reduce((sum, p) => sum + p.amount, 0)
        const averageOrderValue = userPurchases.length > 0 ? totalSpent / userPurchases.length : 0
        const daysSinceLastPurchase = user.lastPurchaseDate ?
            Math.floor((Date.now() - new Date(user.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)) : 999

        // 3. Génération des coupons basée sur le profil et l'historique
        const generatedCoupons: Coupon[] = []

        // VIOLATION OCP: Switch statement géant qui viole le principe Ouvert/Fermé
        switch (user.profile) {
            case 'REGULAR':
                // Logique pour utilisateurs réguliers
                if (user.totalPurchases >= 3) {
                    generatedCoupons.push(this.createPercentageCoupon(userId, 10, 50))
                }
                if (totalSpent > 100) {
                    generatedCoupons.push(this.createFixedAmountCoupon(userId, 15, 100))
                }
                if (daysSinceLastPurchase > 30) {
                    generatedCoupons.push(this.createFreeShippingCoupon(userId))
                }
                break

            case 'PREMIUM':
                // Logique pour utilisateurs premium
                generatedCoupons.push(this.createPercentageCoupon(userId, 15, 100))
                if (user.totalPurchases >= 10) {
                    generatedCoupons.push(this.createPercentageCoupon(userId, 20, 150))
                }
                if (totalSpent > 500) {
                    generatedCoupons.push(this.createFixedAmountCoupon(userId, 50, 200))
                }
                generatedCoupons.push(this.createFreeShippingCoupon(userId))
                if (user.favoriteCategories.includes('ELECTRONICS')) {
                    generatedCoupons.push(this.createCategorySpecificCoupon(userId, 'ELECTRONICS', 25, 200))
                }
                break

            case 'VIP':
                // Logique pour utilisateurs VIP
                generatedCoupons.push(this.createPercentageCoupon(userId, 25, 200))
                generatedCoupons.push(this.createFixedAmountCoupon(userId, 100, 500))
                generatedCoupons.push(this.createFreeShippingCoupon(userId))
                generatedCoupons.push(this.createBuyOneGetOneCoupon(userId, 100))

                // Coupons spéciaux VIP
                if (user.totalSpent > 2000) {
                    generatedCoupons.push(this.createPercentageCoupon(userId, 30, 500))
                }
                if (user.age && user.age > 40) {
                    generatedCoupons.push(this.createSeniorDiscountCoupon(userId, 20, 100))
                }
                if (user.location === 'Nice') {
                    generatedCoupons.push(this.createLocationSpecificCoupon(userId, 'Nice', 15, 100))
                }
                break

            default:
                this.log('ERROR', `Unknown user profile: ${user.profile}`, 'UNKNOWN_PROFILE', { userId, profile: user.profile })
                throw new Error('Profil utilisateur inconnu')
        }

        // 5. Sauvegarde des coupons
        for (const coupon of generatedCoupons) {
            this.coupons.push(coupon)
            this.saveCoupons()
        }

        // 6. Mise à jour des statistiques
        this.updateCouponStats(generatedCoupons)

        // 7. Envoi d'email de notification
        const emailTemplate = this.emailTemplates.find(t => t.type === 'COUPON_GENERATED')
        if (emailTemplate) {
            const couponCodes = generatedCoupons.map(c => c.code).join(', ')
            const emailBody = emailTemplate.body.replace('{couponCode}', couponCodes)
            this.sendEmail(user.email, emailTemplate.subject, emailBody)
        }

        // 8. Logging et audit
        this.log('INFO', `Generated ${generatedCoupons.length} coupons for user ${userId}`, 'COUPON_GENERATION_SUCCESS',
            { userId, couponCount: generatedCoupons.length, profile: user.profile })

        this.auditTrail.push({
            action: 'COUPON_GENERATION',
            userId,
            timestamp: new Date().toISOString(),
            details: { couponCount: generatedCoupons.length, profile: user.profile }
        })

        // 9. Mise à jour des analytics
        this.analyticsData.totalCouponsGenerated += generatedCoupons.length
        this.updateAnalytics()


        return generatedCoupons
    }

    private createPercentageCoupon(userId: string, percentage: number, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'PERCENTAGE',
            discountValue: percentage,
            minOrderAmount,
            maxDiscountAmount: percentage * 2, // Calcul arbitraire
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created percentage coupon ${coupon.code}`, 'COUPON_CREATED', { userId, percentage })
        return coupon
    }

    private createFixedAmountCoupon(userId: string, amount: number, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'FIXED_AMOUNT',
            discountValue: amount,
            minOrderAmount,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created fixed amount coupon ${coupon.code}`, 'COUPON_CREATED', { userId, amount })
        return coupon
    }

    private createFreeShippingCoupon(userId: string): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'FREE_SHIPPING',
            discountValue: 0,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created free shipping coupon ${coupon.code}`, 'COUPON_CREATED', { userId })
        return coupon
    }

    private createBuyOneGetOneCoupon(userId: string, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'BUY_ONE_GET_ONE',
            discountValue: 0,
            minOrderAmount,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created BOGO coupon ${coupon.code}`, 'COUPON_CREATED', { userId })
        return coupon
    }

    private createCategorySpecificCoupon(userId: string, category: string, percentage: number, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'PERCENTAGE',
            discountValue: percentage,
            minOrderAmount,
            applicableCategories: [category],
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created category-specific coupon ${coupon.code}`, 'COUPON_CREATED', { userId, category })
        return coupon
    }

    private createSeniorDiscountCoupon(userId: string, percentage: number, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'PERCENTAGE',
            discountValue: percentage,
            minOrderAmount,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created senior discount coupon ${coupon.code}`, 'COUPON_CREATED', { userId })
        return coupon
    }

    private createLocationSpecificCoupon(userId: string, location: string, percentage: number, minOrderAmount: number): Coupon {
        const coupon: Coupon = {
            id: crypto.randomUUID(),
            code: this.generateCouponCode(),
            discountType: 'PERCENTAGE',
            discountValue: percentage,
            minOrderAmount,
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            userId,
            isUsed: false,
            usageLimit: 1,
            currentUsage: 0,
            createdAt: new Date().toISOString()
        }

        this.log('INFO', `Created location-specific coupon ${coupon.code}`, 'COUPON_CREATED', { userId, location })
        return coupon
    }

    private updateCouponStats(coupons: Coupon[]): void {
        for (const coupon of coupons) {
            const currentCount = this.couponUsageStats.get(coupon.discountType) || 0
            this.couponUsageStats.set(coupon.discountType, currentCount + 1)
        }
    }

    // ===== USE CASE 2: Obtenir les statistiques =====
    async getStatistics(): Promise<any> {
        const totalUsers = this.users.length
        const activeUsers = this.users.filter(u => u.isActive).length
        const totalCoupons = this.coupons.length
        const usedCoupons = this.coupons.filter(c => c.isUsed).length
        const totalRevenue = this.users.reduce((sum, user) => sum + user.totalSpent, 0)

        // Calculs complexes mélangés
        const averageOrderValue = this.users.length > 0 ? totalRevenue / this.users.length : 0
        const couponUsageRate = totalCoupons > 0 ? (usedCoupons / totalCoupons) * 100 : 0

        // Statistiques par profil
        const regularUsers = this.users.filter(u => u.profile === 'REGULAR').length
        const premiumUsers = this.users.filter(u => u.profile === 'PREMIUM').length
        const vipUsers = this.users.filter(u => u.profile === 'VIP').length

        // Statistiques de coupons par type
        const percentageCoupons = this.coupons.filter(c => c.discountType === 'PERCENTAGE').length
        const fixedCoupons = this.coupons.filter(c => c.discountType === 'FIXED_AMOUNT').length
        const freeShippingCoupons = this.coupons.filter(c => c.discountType === 'FREE_SHIPPING').length

        // Calculs de performance système
        const systemUptime = Date.now() - new Date(this.logs[0]?.timestamp || Date.now()).getTime()
        const errorRate = this.logs.length > 0 ? (this.logs.filter(l => l.level === 'ERROR').length / this.logs.length) * 100 : 0

        this.log('INFO', 'Statistics calculated', 'STATS_CALCULATION')

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
                byProfile: {
                    regular: regularUsers,
                    premium: premiumUsers,
                    vip: vipUsers
                }
            },
            coupons: {
                total: totalCoupons,
                used: usedCoupons,
                unused: totalCoupons - usedCoupons,
                usageRate: Math.round(couponUsageRate * 100) / 100,
                byType: {
                    percentage: percentageCoupons,
                    fixedAmount: fixedCoupons,
                    freeShipping: freeShippingCoupons
                }
            },
            revenue: {
                total: Math.round(totalRevenue * 100) / 100,
                averageOrderValue: Math.round(averageOrderValue * 100) / 100
            },
            system: {
                uptime: Math.round(systemUptime / (1000 * 60 * 60)), // heures
                errorRate: Math.round(errorRate * 100) / 100,
                memoryUsage: this.performanceMetrics.memoryUsage,
                requestCount: this.performanceMetrics.requestCount
            },
            analytics: this.analyticsData
        }
    }

    // ===== USE CASE 4: Valider et utiliser un coupon =====
    async validateAndUseCoupon(couponCode: string, userId: string, orderAmount: number): Promise<boolean> {
        const coupon = this.coupons.find(c => c.code === couponCode && c.userId === userId)

        if (!coupon) {
            this.log('WARN', `Coupon ${couponCode} not found for user ${userId}`, 'COUPON_VALIDATION_FAILED', { couponCode, userId })
            return false
        }

        if (coupon.isUsed) {
            this.log('WARN', `Coupon ${couponCode} already used`, 'COUPON_ALREADY_USED', { couponCode, userId })
            return false
        }

        if (new Date() > new Date(coupon.validUntil)) {
            this.log('WARN', `Coupon ${couponCode} expired`, 'COUPON_EXPIRED', { couponCode, userId })
            return false
        }

        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            this.log('WARN', `Order amount too low for coupon ${couponCode}`, 'ORDER_AMOUNT_TOO_LOW', { couponCode, userId, orderAmount })
            return false
        }

        // Marquer le coupon comme utilisé
        coupon.isUsed = true
        coupon.currentUsage++
        this.saveCoupons()

        // Mettre à jour les statistiques
        this.couponUsageStats.set(coupon.discountType, (this.couponUsageStats.get(coupon.discountType) || 0) + 1)
        this.analyticsData.totalCouponsGenerated++ // Erreur: devrait être utilisé, pas généré

        // Logging et audit
        this.log('INFO', `Coupon ${couponCode} used successfully`, 'COUPON_USED', { couponCode, userId, orderAmount })
        this.auditTrail.push({
            action: 'COUPON_USED',
            userId,
            timestamp: new Date().toISOString(),
            details: { couponCode, orderAmount, discountType: coupon.discountType }
        })

        // Envoi d'email de confirmation
        const user = this.users.find(u => u.id === userId)
        if (user) {
            this.sendEmail(user.email, 'Coupon utilisé', `Votre coupon ${couponCode} a été utilisé avec succès!`)
        }

        return true
    }

    
    private saveCoupons(): void {
        try {
            const couponsPath = path.join(__dirname, '../../data/coupons.json')

            // S'assurer que le répertoire data existe
            const dataDir = path.dirname(couponsPath)
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true })
            }

            // Sauvegarder les coupons
            fs.writeFileSync(couponsPath, JSON.stringify(this.coupons, null, 2))
            this.log('INFO', 'Coupons saved', 'DATA_SAVE')
        } catch (error) {
            this.log('ERROR', 'Failed to save coupons', 'DATA_SAVE_ERROR', { error })
        }
    }

    async getAllUsers(): Promise<User[]> {
        this.log('INFO', 'All users retrieved', 'DATA_RETRIEVAL')
        return this.users
    }

    async getAllCoupons(): Promise<Coupon[]> {
        this.log('INFO', 'All coupons retrieved', 'DATA_RETRIEVAL')
        return this.coupons
    }

    async getUserById(id: string): Promise<User | null> {
        const user = this.users.find(u => u.id === id) || null
        this.log('INFO', `User ${id} retrieved`, 'DATA_RETRIEVAL')
        return user
    }

    async getCouponById(id: string): Promise<Coupon | null> {
        const coupon = this.coupons.find(c => c.id === id) || null
        this.log('INFO', `Coupon ${id} retrieved`, 'DATA_RETRIEVAL')
        return coupon
    }

    async getCouponsByUser(userId: string): Promise<Coupon[]> {
        const userCoupons = this.coupons.filter(c => c.userId === userId)
        this.log('INFO', `Coupons for user ${userId} retrieved`, 'DATA_RETRIEVAL')
        return userCoupons
    }


}
