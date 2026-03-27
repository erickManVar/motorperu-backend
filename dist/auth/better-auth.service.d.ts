import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class BetterAuthService implements OnModuleInit {
    private configService;
    private _auth;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    get auth(): any;
}
