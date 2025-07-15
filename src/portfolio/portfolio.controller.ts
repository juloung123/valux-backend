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
import { PortfolioService } from './portfolio.service';
import {
  PortfolioOverviewDto,
  PortfolioPositionDto,
  TransactionQueryDto,
  TransactionListResponseDto,
  PortfolioExportQueryDto,
  PortfolioExportResponseDto,
} from './dto';

@ApiTags('Portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('user/:address')
  @ApiOperation({
    summary: 'Get portfolio overview',
    description: 'Retrieve comprehensive portfolio overview including total value, P&L, and performance metrics',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio overview retrieved successfully',
    type: PortfolioOverviewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getPortfolioOverview(
    @Param('address') address: string,
  ): Promise<PortfolioOverviewDto> {
    return this.portfolioService.getPortfolioOverview(address);
  }

  @Get('user/:address/positions')
  @ApiOperation({
    summary: 'Get portfolio positions',
    description: 'Retrieve detailed information about all portfolio positions for a user',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio positions retrieved successfully',
    type: [PortfolioPositionDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getPortfolioPositions(
    @Param('address') address: string,
  ): Promise<PortfolioPositionDto[]> {
    return this.portfolioService.getPortfolioPositions(address);
  }

  @Get('user/:address/transactions')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Retrieve paginated transaction history with filtering options',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter by transaction type',
    required: false,
    enum: ['deposit', 'withdrawal', 'distribution', 'reinvest'],
  })
  @ApiQuery({
    name: 'vaultId',
    description: 'Filter by vault ID',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by transaction status',
    required: false,
    enum: ['pending', 'confirmed', 'failed'],
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601)',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: TransactionListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getTransactionHistory(
    @Param('address') address: string,
    @Query('type') type?: string,
    @Query('vaultId') vaultId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TransactionListResponseDto> {
    const query: TransactionQueryDto = {
      address,
      ...(type && { type }),
      ...(vaultId && { vaultId }),
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.portfolioService.getTransactionHistory(query);
  }

  @Get('user/:address/export')
  @ApiOperation({
    summary: 'Export portfolio data',
    description: 'Export portfolio data for tax purposes in various formats (CSV, JSON, PDF)',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiQuery({
    name: 'format',
    description: 'Export format',
    required: false,
    enum: ['csv', 'json', 'pdf'],
  })
  @ApiQuery({
    name: 'year',
    description: 'Tax year for export',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for export (ISO 8601)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for export (ISO 8601)',
    required: false,
  })
  @ApiQuery({
    name: 'taxableOnly',
    description: 'Include only taxable events',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio data exported successfully',
    type: PortfolioExportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async exportPortfolioData(
    @Param('address') address: string,
    @Query('format') format?: string,
    @Query('year') year?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('taxableOnly') taxableOnly?: string,
  ): Promise<PortfolioExportResponseDto> {
    const query: PortfolioExportQueryDto = {
      address,
      ...(format && { format: format as 'csv' | 'json' | 'pdf' }),
      ...(year && { year: parseInt(year, 10) }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      taxableOnly: taxableOnly === 'true',
    };

    return this.portfolioService.exportPortfolioData(query);
  }
}