import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {ScrapeRequestDto} from './dto/scrape-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create scraping task', description: 'Create a new scraping task for the specified URL. Returns task id and initial status.' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiBody({ type: ScrapeRequestDto })
  createTask(@Body() dto: ScrapeRequestDto ) {
    return this.tasksService.createTask(dto.url, dto.type, dto.options)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task status', description: 'Return current status and result (if available) for a given task id.' })
  @ApiResponse({ status: 200, description: 'Task found and returned.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  getTaskStatus(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }
}
