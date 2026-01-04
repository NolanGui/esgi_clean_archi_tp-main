export interface ILogger {
    log(level: 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any): void;
    getLogs(): any[];
}

export class ConsoleLogger implements ILogger {
    private logs: any[] = [];

    log(level: 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any): void {
        const entry = { timestamp: new Date().toISOString(), level, message, metadata };
        this.logs.push(entry);
    }

    getLogs(): any[] {
        return this.logs;
    }
}