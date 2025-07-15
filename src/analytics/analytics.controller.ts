import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { AnalyticsService } from './analytics.service';
import {
  PlatformAnalyticsDto,
  TvlMetricsDto,
  TvlMetricsQueryDto,
  UserAnalyticsDto,
} from './dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  @ApiOperation({
    summary: 'Get platform analytics',
    description: 'Retrieve comprehensive platform-wide analytics including TVL, users, transactions, and protocol distribution',
  })
  @ApiResponse({
    status: 200,
    description: 'Platform analytics retrieved successfully',
    type: PlatformAnalyticsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.OK)
  async getPlatformAnalytics(): Promise<PlatformAnalyticsDto> {
    return this.analyticsService.getPlatformAnalytics();
  }

  @Get('tvl')
  @ApiOperation({
    summary: 'Get TVL metrics',
    description: 'Retrieve Total Value Locked metrics with historical data for different timeframes',
  })
  @ApiQuery({
    name: 'timeframe',
    description: 'Time frame for TVL metrics',
    required: false,
    enum: ['24h', '7d', '30d', '1y'],
  })
  @ApiResponse({
    status: 200,
    description: 'TVL metrics retrieved successfully',
    type: TvlMetricsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.OK)
  async getTvlMetrics(
    @Query('timeframe') timeframe?: string,
  ): Promise<TvlMetricsDto> {
    const query: TvlMetricsQueryDto = {
      timeframe: timeframe as '24h' | '7d' | '30d' | '1y',
    };

    return this.analyticsService.getTvlMetrics(query);
  }

  @Get('user/:address')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user analytics',
    description: 'Retrieve detailed analytics for a specific user including portfolio performance, rules, and rankings',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    type: UserAnalyticsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.OK)
  async getUserAnalytics(
    @Param('address') address: string,
  ): Promise<UserAnalyticsDto> {
    return this.analyticsService.getUserAnalytics(address);
  }
}