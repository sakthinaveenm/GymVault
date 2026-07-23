import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, UserPayload } from './current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User successfully registered.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiOkResponse({ description: 'User successfully logged in.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('favorites/:exerciseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle exercise favorite status' })
  @ApiOkResponse({ description: 'Favorite status updated successfully.' })
  toggleFavorite(@CurrentUser() user: UserPayload, @Param('exerciseId') exerciseId: string) {
    return this.authService.toggleFavorite(user.id, exerciseId);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user favorite exercise IDs' })
  @ApiOkResponse({ description: 'List of favorite exercise IDs.' })
  getFavorites(@CurrentUser() user: UserPayload) {
    return this.authService.getFavorites(user.id);
  }
}
