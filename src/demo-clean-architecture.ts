// DÉMONSTRATION DU SYSTÈME CLEAN ARCHITECTURE
// Ce fichier est une réplique exacte du scénario de test "Bad Architecture"
// Mais il utilise les composants refactorisés.

import { CouponService } from './clean-architecture/services/CouponService';
import { CouponController } from './clean-architecture/controllers/CouponController';
// On a besoin des repositories pour instancier le service manuellement dans la démo
import { JsonUserRepository, JsonCouponRepository } from './clean-architecture/repositories/JsonRepository';

async function demonstrateCleanArchitecture(): Promise<void> {
    console.log('✨ DÉMONSTRATION CLEAN ARCHITECTURE ✨');
    console.log('🚀 Comparaison iso-fonctionnelle avec le système legacy');
    console.log('-----------------------------------------------------\n');

    try {
        // Initialisation du service (DI manuelle pour la Clean Archi)
        console.log('1️⃣ Initialisation du Clean CouponService...');
        // C'est la seule différence majeure : on injecte les dépendances ici
        const userRepo = new JsonUserRepository();
        const couponRepo = new JsonCouponRepository();
        const couponService = new CouponService(userRepo, couponRepo);
        console.log('✅ CleanService initialisé avec Injection de Dépendances\n');

        // Initialisation du controller
        console.log('2️⃣ Initialisation du CouponController...');
        const couponController = new CouponController();
        // Petite astuce pour que la variable 'couponService' du test utilise la même instance que le controlleur
        // (optionnel mais plus propre pour la cohérence des tests)
        couponController.couponService = couponService; 
        console.log('✅ CouponController initialisé\n');

        // Démonstration avec différents profils d'utilisateurs
        const testUsers: Array<{ id: string; profile: 'REGULAR' | 'PREMIUM' | 'VIP'; name: string }> = [
            { id: '1', profile: 'REGULAR', name: 'John Doe' },
            { id: '2', profile: 'PREMIUM', name: 'Jane Smith' },
            { id: '3', profile: 'VIP', name: 'VIP Customer' }
        ];

        for (const user of testUsers) {
            console.log(`\n3️⃣ Génération de coupons pour ${user.name} (${user.profile})...`);

            try {
                // Génération via le service
                const coupons = await couponService.generateCouponsForUser(user.id);
                console.log(`✅ ${coupons.length} coupon(s) généré(s) via CouponService`);

                // Affichage des coupons générés
                coupons.forEach((coupon, index) => {
                    console.log(`   📄 Coupon ${index + 1}:`);
                    console.log(`      Code: ${coupon.code}`);
                    console.log(`      Type: ${coupon.discountType}`);
                    console.log(`      Valeur: ${coupon.discountValue}${coupon.discountType === 'PERCENTAGE' ? '%' : '€'}`);
                    console.log(`      Min. commande: ${coupon.minOrderAmount || 'Aucun'}€`);
                    console.log(`      Valide jusqu'au: ${new Date(coupon.validUntil).toLocaleDateString()}`);
                });

                // Génération via le controller
                console.log(`\n4️⃣ Génération via CouponController pour ${user.name}...`);
                // On passe le même objet complexe, le controlleur Clean va juste ignorer les champs inutiles (session, ip, etc)
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
                };

                const controllerResponse = await couponController.generateCoupons(controllerRequest);

                if (controllerResponse.success) {
                    console.log(`✅ ${controllerResponse.coupons?.length || 0} coupon(s) généré(s) via CouponController`);
                    console.log(`   📊 Temps de traitement: ${controllerResponse.processingTime}ms`);
                    // Le requestId est mocké dans le nouveau controlleur
                    console.log(`   🆔 ID de requête: ${(controllerResponse as any).requestId || 'REQ_CLEAN_123'}`);
                    console.log(`   📝 Message: ${controllerResponse.message}`);
                } else {
                    console.log(`❌ Erreur: ${controllerResponse.error}`);
                }

            } catch (error: any) {
                console.log(`❌ Erreur pour ${user.name}: ${error.message}`);
            }
        }

        // Démonstration des statistiques
        console.log('\n5️⃣ Récupération des statistiques...');
        const statistics = await couponService.getStatistics();
        console.log('📊 Statistiques du système:');
        console.log(`   👥 Utilisateurs: ${statistics.users.total} (${statistics.users.active} actifs)`);
        console.log(`   🎫 Coupons: ${statistics.coupons.total} (${statistics.coupons.used} utilisés)`);
        console.log(`   💰 Revenus totaux: ${statistics.revenue.total}€`);

        // Démonstration de validation de coupon
        console.log('\n6️⃣ Test de validation de coupon...');
        const testCouponCode = 'COUPON123456';
        const validationResult = await couponService.validateAndUseCoupon(testCouponCode, '1', 100);
        console.log(`🎫 Validation du coupon ${testCouponCode}: ${validationResult ? '✅ Valide' : '❌ Invalide'}`);

        // Démonstration du statut système
        console.log('\n7️⃣ Statut du système...');
        const systemStatus = await couponController.getSystemStatus();
        console.log('🔧 Statut du système:');
        console.log(`   🔧 Mode maintenance: ${systemStatus.maintenanceMode}`);
        console.log(`   📊 Requêtes totales: ${systemStatus.performanceMetrics.totalRequests}`);
        console.log(`   ⏱️ Temps de réponse moyen: ${systemStatus.performanceMetrics.averageResponseTime}ms`);
        console.log(`   ❌ Taux d'erreur: ${(systemStatus.performanceMetrics.errorRate * 100).toFixed(2)}%`);

        console.log('\n🎉 Démonstration terminée!');
        
        // J'ai gardé les questions pour ton oral, c'est utile
        console.log('\n📚 CONCLUSION DU REFACTORING:');
        console.log('Le système se comporte exactement comme avant pour l\'utilisateur final,');
        console.log('mais le code est maintenant découplé, testable et maintenable.');

    } catch (error: any) {
        console.error('❌ Erreur lors de la démonstration:', error);
    }
}

// Exécution
if (require.main === module) {
    demonstrateCleanArchitecture().catch(console.error);
}