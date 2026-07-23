import { Body, Controller, Get, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';
import { LogMealDto } from './dto/log-meal.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@ApiTags('Nutrition')
@Controller('nutrition')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('meal')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a food item meal' })
  @ApiCreatedResponse({ description: 'Meal successfully logged.' })
  async logMeal(@CurrentUser() user: UserPayload, @Body() logMealDto: LogMealDto) {
    const log = await this.nutritionService.logMeal(user.id, logMealDto);
    return {
      success: true,
      message: 'Meal logged successfully',
      data: log,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all daily nutrition logs' })
  @ApiOkResponse({ description: 'List of daily nutrition logs.' })
  async getLogs(@CurrentUser() user: UserPayload) {
    const logs = await this.nutritionService.getLogs(user.id);
    return {
      success: true,
      message: 'Logs retrieved successfully',
      data: logs,
    };
  }

  @Post('goals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update nutrition calorie & macro goals' })
  @ApiOkResponse({ description: 'Goals updated successfully.' })
  async updateGoals(@CurrentUser() user: UserPayload, @Body() updateGoalsDto: UpdateGoalsDto) {
    const goals = await this.nutritionService.updateGoals(user.id, updateGoalsDto);
    return {
      success: true,
      message: 'Nutrition goals updated successfully',
      data: goals,
    };
  }

  @Get('goals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user nutrition goals' })
  @ApiOkResponse({ description: 'Nutrition goals retrieved.' })
  async getGoals(@CurrentUser() user: UserPayload) {
    const goals = await this.nutritionService.getGoals(user.id);
    return {
      success: true,
      message: 'Goals retrieved successfully',
      data: goals,
    };
  }
}
