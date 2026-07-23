import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { LogWeightDto } from './dto/log-weight.dto';
import { LogMeasurementDto } from './dto/log-measurement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../auth/current-user.decorator';

@ApiTags('Analytics & Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('weight')
  @ApiOperation({ summary: 'Log body weight' })
  @ApiCreatedResponse({ description: 'Weight successfully logged.' })
  logWeight(@CurrentUser() user: UserPayload, @Body() logWeightDto: LogWeightDto) {
    return this.analyticsService.logWeight(user.id, logWeightDto);
  }

  @Get('weight')
  @ApiOperation({ summary: 'Get weight logs' })
  @ApiOkResponse({ description: 'List of weight logs in chronological order.' })
  findWeights(@CurrentUser() user: UserPayload) {
    return this.analyticsService.findWeights(user.id);
  }

  @Post('measurements')
  @ApiOperation({ summary: 'Log body measurements' })
  @ApiCreatedResponse({ description: 'Body measurements successfully logged.' })
  logMeasurements(@CurrentUser() user: UserPayload, @Body() logMeasurementDto: LogMeasurementDto) {
    return this.analyticsService.logMeasurements(user.id, logMeasurementDto);
  }

  @Get('measurements')
  @ApiOperation({ summary: 'Get measurement logs' })
  @ApiOkResponse({ description: 'List of body measurement logs.' })
  findMeasurements(@CurrentUser() user: UserPayload) {
    return this.analyticsService.findMeasurements(user.id);
  }

  @Get('prs')
  @ApiOperation({ summary: 'Get personal records' })
  @ApiOkResponse({ description: 'Personal records calculated from completed sets.' })
  findPersonalRecords(@CurrentUser() user: UserPayload) {
    return this.analyticsService.findPersonalRecords(user.id);
  }
}
