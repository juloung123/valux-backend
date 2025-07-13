import { Controller, Post, Body, Get, Query, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { 
  LoginDto, 
  AuthResponseDto, 
  RefreshTokenDto, 
  NonceResponseDto 
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  @ApiOperation({ 
    summary: 'Generate nonce for wallet authentication',
    description: 'Get a unique nonce to sign with your wallet for authentication.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Nonce generated successfully',
    type: NonceResponseDto
  })
  async getNonce(@Query('address') address: string): Promise<NonceResponseDto> {
    return this.authService.generateNonce(address);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login with wallet signature',
    description: 'Authenticate using wallet signature verification and receive JWT tokens.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Authentication successful',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid nonce or signature'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid signature'
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generate new access and refresh tokens using a valid refresh token.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Token refreshed successfully',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid refresh token'
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile information.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User profile retrieved successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid or missing token'
  })
  async getProfile(@Request() req: any) {
    return {
      userId: req.user.userId,
      address: req.user.address,
      message: 'Authentication successful',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout the authenticated user (client should discard tokens).'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logout successful'
  })
  async logout(@Request() req: any) {
    // In a production app, you might want to blacklist the token
    // For now, we just return success (client should discard tokens)
    return {
      message: 'Logout successful',
      userId: req.user.userId,
    };
  }
}
