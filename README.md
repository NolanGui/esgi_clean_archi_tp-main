# 🏢 LuxeCommerce - Mission de Refactoring Architectural

## 📋 Contexte Professionnel

**LuxeCommerce**, leader français du e-commerce de luxe, traverse une crise financière majeure. Après plusieurs années d'accumulation de dette technique, l'entreprise voit son chiffre d'affaires chuter drastiquement et peine à générer de nouvelles ventes et attirer de nouveaux clients.

### 🎯 Mission CTO

Vous venez d'être embauché en tant que **nouveau CTO** avec pour mission critique :

- **Auditer** le microservice stratégique de génération de coupons pour la base utilisateurs
- **Analyser** les problèmes d'architecture identifiés
- **Résoudre** ces problèmes en proposant une solution basée sur les principes de **Clean Architecture**
- **Proposer** des métriques démontrant les bénéfices de cette nouvelle architecture

---

## 🔍 Analyse du Système Actuel

### CouponService - Architecture Monolithique

Le `CouponService` actuel présente une architecture monolithique avec de multiples violations des principes SOLID :

#### Fonctionnalités Principales

- **Génération de coupons** basée sur le profil utilisateur (REGULAR, PREMIUM, VIP)
- **Calculs de statistiques** complexes mélangés à la logique métier
- **Gestion des emails** et notifications intégrée
- **Logging et audit** dispersés dans toute l'application
- **Persistance des données** via fichiers JSON
- **Analytics et métriques** calculées en temps réel

#### Types de Coupons Supportés

- **PERCENTAGE** : Réduction en pourcentage
- **FIXED_AMOUNT** : Réduction en montant fixe
- **FREE_SHIPPING** : Livraison gratuite
- **BUY_ONE_GET_ONE** : Achetez un, obtenez-en un gratuit

#### Logique de Génération par Profil

- **REGULAR** : Coupons basiques selon l'historique d'achat
- **PREMIUM** : Coupons améliorés avec avantages supplémentaires
- **VIP** : Coupons premium avec réductions importantes et avantages exclusifs

---

## 🏗️ Architecture Cible - Clean Architecture

### Structure Requise

Votre solution devra être organisée selon les couches suivantes :

```
src/clean-architecture/
├── entities/           # Entités métier (User, Coupon, etc.)
├── repositories/       # Interfaces et implémentations de persistance
├── services/          # Logique métier pure
└── controllers/       # Points d'entrée (même API que l'ancien controller)
```

### Patterns Obligatoires

Votre implémentation devra intégrer **à minima** :

- **Strategy Pattern** : Pour la génération de coupons selon le profil utilisateur

ET/OU

- **Factory Pattern** : Pour la création des différents types de coupons

### Contraintes Techniques

- **Même API** : Le nouveau controller devra exposer exactement les mêmes endpoints que l'ancien
- **Compatibilité** : Les données existantes doivent être préservées
- **Maintenabilité** : Code facilement extensible et testable

---

## 📊 Métriques de Succès

Votre refactoring devra démontrer des améliorations mesurables sur :

- **Maintenabilité** du code (complexité cyclomatique)
- **Testabilité** (couverture de tests)
- **Extensibilité** (facilité d'ajout de nouvelles fonctionnalités)
- **Séparation des responsabilités** (respect des principes SOLID)

---

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Compilation TypeScript
npm run build

# Démonstration de l'architecture actuelle
npm run demo:bad-architecture
```

### 📊 Données de Test

Le script `npm run demo:bad-architecture` utilise une **pseudo-database** composée de fichiers JSON dans le répertoire `data/` :

- **`users.json`** : Base d'utilisateurs avec différents profils (REGULAR, PREMIUM, VIP)
- **`purchases.json`** : Historique des achats pour calculer les statistiques
- **`coupons.json`** : Coupons générés (créé automatiquement lors de l'exécution)
- **`logs.json`** : Logs système (mis à jour en temps réel)

Cette pseudo-database permet de tester le système avec des données réalistes sans nécessiter une vraie base de données.

---

## 📁 Structure du Projet

```
├── src/
│   ├── bad-architecture/     # Code actuel à analyser
│   │   ├── CouponService.ts
│   │   └── CouponController.ts
│   └── clean-architecture/   # Votre solution
│       ├── entities/
│       ├── repositories/
│       ├── services/
│       └── controllers/
├── data/                    # Données de test
└── dist/                    # Code compilé
```

---

## ⚠️ Points d'Attention

- **Ne pas modifier** l'architecture existante dans `bad-architecture/`
- **Préserver** toutes les fonctionnalités actuelles
- **Documenter** vos choix architecturaux
- **Justifier** l'utilisation des patterns choisis
- **Mesurer** les améliorations apportées

---

_Cette mission est critique pour la survie de LuxeCommerce. Votre expertise en Clean Architecture sera déterminante pour redresser la situation financière de l'entreprise._
