import * as fs from 'fs';
import * as path from 'path';
import { IUserRepository, ICouponRepository, IPurchaseRepository } from './IRepository';
import { User, Coupon, PurchaseHistory } from '../entities/types';

// ... (Garder JsonUserRepository et JsonCouponRepository comme avant) ...
// Ajout de : 

export class JsonPurchaseRepository implements IPurchaseRepository {
    private filePath = path.join(__dirname, '../../../data/purchases.json');

    async findByUserId(userId: string): Promise<PurchaseHistory[]> {
        if (!fs.existsSync(this.filePath)) return [];
        const purchases: any[] = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        return purchases.filter(p => p.userId === userId);
    }
}

// NOTE: Ajoute aussi findAll() dans JsonUserRepository et JsonCouponRepository !
// Exemple pour JsonUserRepository:
// async findAll(): Promise<User[]> {
//     if (!fs.existsSync(this.filePath)) return [];
//     return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
// }
// Idem pour CouponRepo