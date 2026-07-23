import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';

@ApiTags('Routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workout routine' })
  @ApiCreatedResponse({ description: 'Routine created successfully.' })
  create(@CurrentUser() user: UserPayload, @Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(user.id, createRoutineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user routines' })
  @ApiOkResponse({ description: 'List of user routines.' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.routinesService.findAll(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a routine' })
  @ApiOkResponse({ description: 'Routine deleted successfully.' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.routinesService.remove(user.id, id);
  }
}
