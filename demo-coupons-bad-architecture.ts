// DÉMONSTRATION DU SYSTÈME DE GÉNÉRATION DE COUPONS
// Ce fichier montre comment utiliser le MonolithicService et le CouponController
// ATTENTION: Ce code viole intentionnellement tous les principes SOLID pour l'apprentissage!

import { CouponService } from './src/bad-architecture/CouponService'
import { CouponController } from './src/bad-architecture/CouponController'

async function demonstrateCouponSystem(): Promise<void> {
    console.log('🚀 Démonstration du système de génération de coupons')
    console.log('⚠️  ATTENTION: Ce code viole intentionnellement les principes SOLID!')
    console.log('📚 Utilisez ce code pour identifier les problèmes d\'architecture\n')

    try {
        // Initialisation du service monolithique
        console.log('1️⃣ Initialisation du Monolithic CouponService...')
        const couponService = new CouponService()
        console.log('✅ MonolithicService initialisé\n')

        // Initialisation du controller
        console.log('2️⃣ Initialisation du CouponController...')
        const couponController = new CouponController()
        console.log('✅ CouponController initialisé\n')

        // Démonstration avec différents profils d'utilisateurs
        const testUsers: Array<{ id: string; profile: 'REGULAR' | 'PREMIUM' | 'VIP'; name: string }> = [
            { id: '1', profile: 'REGULAR', name: 'John Doe' },
            { id: '2', profile: 'PREMIUM', name: 'Jane Smith' },
            { id: '3', profile: 'VIP', name: 'VIP Customer' }
        ]

        for (const user of testUsers) {
            console.log(`\n3️⃣ Génération de coupons pour ${user.name} (${user.profile})...`)

            try {
                // Génération via le service monolithique
                const coupons = await couponService.generateCouponsForUser(user.id)
                console.log(`✅ ${coupons.length} coupon(s) généré(s) via CouponService`)

                // Affichage des coupons générés
                coupons.forEach((coupon, index) => {
                    console.log(`   📄 Coupon ${index + 1}:`)
                    console.log(`      Code: ${coupon.code}`)
                    console.log(`      Type: ${coupon.discountType}`)
                    console.log(`      Valeur: ${coupon.discountValue}${coupon.discountType === 'PERCENTAGE' ? '%' : '€'}`)
                    console.log(`      Min. commande: ${coupon.minOrderAmount || 'Aucun'}€`)
                    console.log(`      Valide jusqu'au: ${new Date(coupon.validUntil).toLocaleDateString()}`)
                })

                // Génération via le controller
                console.log(`\n4️⃣ Génération via CouponController pour ${user.name}...`)
                const controllerRequest = {
                    userId: user.id,
                    userProfile: user.profile,
                    userEmail: `${user.name.toLowerCase().replace(' ', '.')}@email.com`,
                    userFirstName: user.name.split(' ')[0],
                    userLastName: user.name.split(' ')[1],
                    requestSource: 'DEMO' as 'WEB' | 'MOBILE' | 'API' | 'ADMIN',
                    sessionId: `session_${user.id}`,
                    ipAddress: '192.168.1.100',
                    userAgent: 'Demo Browser',
                    timestamp: new Date().toISOString()
                }

                const controllerResponse = await couponController.generateCoupons(controllerRequest)

                if (controllerResponse.success) {
                    console.log(`✅ ${controllerResponse.coupons?.length || 0} coupon(s) généré(s) via CouponController`)
                    console.log(`   📊 Temps de traitement: ${controllerResponse.processingTime}ms`)
                    console.log(`   🆔 ID de requête: ${controllerResponse.requestId}`)
                    console.log(`   📝 Message: ${controllerResponse.message}`)
                } else {
                    console.log(`❌ Erreur: ${controllerResponse.error}`)
                }

            } catch (error: any) {
                console.log(`❌ Erreur pour ${user.name}: ${error.message}`)
            }
        }

        // Démonstration des statistiques
        console.log('\n5️⃣ Récupération des statistiques...')
        const statistics = await couponService.getStatistics()
        console.log('📊 Statistiques du système:')
        console.log(`   👥 Utilisateurs: ${statistics.users.total} (${statistics.users.active} actifs)`)
        console.log(`   🎫 Coupons: ${statistics.coupons.total} (${statistics.coupons.used} utilisés)`)
        console.log(`   💰 Revenus totaux: ${statistics.revenue.total}€`)

        // Démonstration de validation de coupon
        console.log('\n6️⃣ Test de validation de coupon...')
        const testCouponCode = 'COUPON123456'
        const validationResult = await couponService.validateAndUseCoupon(testCouponCode, '1', 100)
        console.log(`🎫 Validation du coupon ${testCouponCode}: ${validationResult ? '✅ Valide' : '❌ Invalide'}`)

        // Démonstration du statut système
        console.log('\n7️⃣ Statut du système...')
        const systemStatus = await couponController.getSystemStatus()
        console.log('🔧 Statut du système:')
        console.log(`   🔧 Mode maintenance: ${systemStatus.maintenanceMode}`)
        console.log(`   📊 Requêtes totales: ${systemStatus.performanceMetrics.totalRequests}`)
        console.log(`   ⏱️ Temps de réponse moyen: ${systemStatus.performanceMetrics.averageResponseTime}ms`)
        console.log(`   ❌ Taux d'erreur: ${(systemStatus.performanceMetrics.errorRate * 100).toFixed(2)}%`)

        console.log('\n🎉 Démonstration terminée!')
        console.log('\n📚 QUESTIONS POUR RÉFLEXION:')
        console.log('1. Que pensez-vous de l\'organisation de ces classes ?')
        console.log('2. Quelles sont les différentes responsabilités que vous identifiez ?')
        console.log('3. Comment pourriez-vous séparer ces responsabilités ?')
        console.log('4. Quels sont les problèmes de testabilité que vous observez ?')
        console.log('5. Comment pourriez-vous améliorer la maintenabilité ?')
        console.log('6. Quelles violations des principes SOLID pouvez-vous identifier ?')
        console.log('7. Comment ces classes violent-elles le principe de responsabilité unique ?')
        console.log('8. Quels sont les problèmes de couplage et de dépendances ?')
        console.log('9. Comment cette architecture impacte-t-elle l\'extensibilité ?')
        console.log('10. Quels patterns pourriez-vous utiliser pour améliorer cette architecture ?')

    } catch (error: any) {
        console.error('❌ Erreur lors de la démonstration:', error)
    }
}

// Fonction pour guider l'analyse
function guideAnalysis(): void {
    console.log('\n🔍 GUIDE D\'ANALYSE ARCHITECTURALE:')
    console.log('\n📋 QUESTIONS D\'ANALYSE:')
    console.log('1. Combien de responsabilités différentes pouvez-vous identifier dans CouponService ?')
    console.log('2. Que fait exactement la méthode generateCouponsForUser ?')
    console.log('3. Quels sont les différents types de données manipulées par cette classe ?')
    console.log('4. Comment les nouvelles fonctionnalités seraient-elles ajoutées dans cette architecture ?')
    console.log('5. Que se passerait-il si vous deviez changer la logique de génération de coupons ?')
    console.log('6. Comment testeriez-vous individuellement chaque fonctionnalité ?')
    console.log('7. Quelles sont les dépendances externes de cette classe ?')
    console.log('8. Comment cette architecture gère-t-elle les erreurs et les cas d\'exception ?')
    console.log('9. Que pensez-vous de la taille et de la complexité de ces classes ?')
    console.log('10. Comment cette architecture respecte-t-elle le principe DRY (Don\'t Repeat Yourself) ?')

    console.log('\n🎯 OBJECTIFS DE REFACTORING:')
    console.log('- Identifier les violations des principes SOLID')
    console.log('- Proposer une architecture en couches')
    console.log('- Implémenter des patterns appropriés')
    console.log('- Améliorer la testabilité et la maintenabilité')
    console.log('- Mesurer les bénéfices de la nouvelle architecture')
}

// Exécution de la démonstration
if (require.main === module) {
    demonstrateCouponSystem()
        .then(() => {
            guideAnalysis()
            console.log('\n🏁 Démonstration terminée - Arrêt du processus')
            process.exit(0) // Force la terminaison pour éviter que les setInterval bloquent
        })
        .catch((error: any) => {
            console.error('Erreur fatale:', error)
            process.exit(1)
        })
}

export { demonstrateCouponSystem, guideAnalysis }
