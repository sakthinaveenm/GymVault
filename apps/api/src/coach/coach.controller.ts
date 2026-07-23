import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ChatDto {
  message: string;
  history: any[];
  routines: any[];
  weights: any[];
}

@ApiTags('AI Coach')
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a chat message to the AI coach' })
  @ApiOkResponse({ description: 'Response generated successfully by the coach.' })
  async chat(@Body() body: ChatDto) {
    const { message, history, routines, weights } = body;
    return this.coachService.generateResponse(
      message || '',
      history || [],
      routines || [],
      weights || [],
    );
  }
}
