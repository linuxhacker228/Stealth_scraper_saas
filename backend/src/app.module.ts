import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config";
import {BullModule} from "@nestjs/bullmq";
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true,
  }), BullModule.forRoot({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }), TasksModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
