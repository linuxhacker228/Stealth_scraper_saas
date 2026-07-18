import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(configService: ConfigService) {
        const pool = new Pool({ connectionString: configService.get<string>('DATABASE_URL') });
        const adapter = new PrismaPg(pool);

        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
    }
}
