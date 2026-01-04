import { User, Coupon, PurchaseHistory } from '../entities/types';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
}

export interface ICouponRepository {
    save(coupon: Coupon): Promise<void>;
    findByUserId(userId: string): Promise<Coupon[]>;
    findAll(): Promise<Coupon[]>;
}

export interface IPurchaseRepository {
    findByUserId(userId: string): Promise<PurchaseHistory[]>;
}