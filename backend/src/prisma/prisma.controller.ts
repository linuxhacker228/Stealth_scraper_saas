import { Controller } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('prisma')
@Controller('prisma')
export class PrismaController {
  constructor(private readonly prismaService: PrismaService) {}
}
