import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter exercises by name' })
  @ApiOkResponse({ description: 'List of exercises successfully retrieved.' })
  findAll(@Query('search') search?: string) {
    return this.exercisesService.findAll(search);
  }
}
