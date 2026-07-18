import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {InjectQueue} from "@nestjs/bullmq";
import {Queue} from "bullmq";
import {NotFoundError} from "rxjs";

@Injectable()
export class TasksService {
    constructor(private prismaService: PrismaService, @InjectQueue('scraper-queue') private readonly taskQueue: Queue) {}
    async createTask(url: string, type: 'FAST' | 'STEALTH', options?: any) {
        const task = await this.prismaService.scrapeTask.create({
            data: {
                url,
                type,
                options: options || null
            },
        });
        console.log(options);
        await this.taskQueue.add('task', {
            taskId: task.id,
            url: task.url,
            options: options,
        });
        return {
            taskId: task.id,
            status: 'PENDING',
            success: true,
        }
    }
    async getTaskById(id: string) {
        const task = await this.prismaService.scrapeTask.findUnique({
            where: {
                id,
            },
            include: {
                result: true,
            }
        });
        if(!task) {
            throw new NotFoundException('Task not found');
        }
        return task;
    }
}
