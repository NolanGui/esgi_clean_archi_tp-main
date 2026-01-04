export interface INotificationService {
    sendEmail(to: string, subject: string, body: string): void;
    sendCouponGeneratedEmail(email: string, couponCodes: string[]): void;
}

export class MockEmailService implements INotificationService {
    sendEmail(to: string, subject: string, body: string): void {
        console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    }

    sendCouponGeneratedEmail(email: string, couponCodes: string[]): void {
        const body = `Félicitations ! Voici vos coupons : ${couponCodes.join(', ')}`;
        this.sendEmail(email, 'Vos coupons sont arrivés !', body);
    }
}