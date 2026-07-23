import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateLoggedWorkoutDto } from './dto/create-logged-workout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';

@ApiTags('Workout History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Log a completed workout' })
  @ApiCreatedResponse({ description: 'Workout successfully logged in history.' })
  create(@CurrentUser() user: UserPayload, @Body() createLoggedWorkoutDto: CreateLoggedWorkoutDto) {
    return this.historyService.create(user.id, createLoggedWorkoutDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all logged workouts' })
  @ApiOkResponse({ description: 'List of logged workouts in history.' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.historyService.findAll(user.id);
  }
}
