import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import {BullModule} from "@nestjs/bullmq";
import {PrismaService} from "../prisma/prisma.service";
import {TasksProcessor} from "./tasks.processor";

@Module({
  imports: [BullModule.registerQueue({
    name: 'scraper-queue',
  })],
  controllers: [TasksController],
  providers: [TasksService, PrismaService, TasksProcessor],
})
export class TasksModule {}
