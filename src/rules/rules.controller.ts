import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { RulesService } from './rules.service';
import {
  CreateRuleDto,
  UpdateRuleDto,
  RuleDto,
  ExecuteRuleResponseDto,
  RuleFilterDto,
  RuleListResponseDto,
} from './dto';

@ApiTags('Rules')
@Controller('rules')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiBearerAuth()
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create automation rule',
    description: 'Create a new profit distribution automation rule with validation',
  })
  @ApiBody({
    description: 'Rule creation data',
    type: CreateRuleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Rule created successfully',
    type: RuleDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid rule configuration (e.g., percentages not summing to 100%)',
  })
  @ApiResponse({
    status: 404,
    description: 'Vault not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createRule(@Body() createRuleDto: CreateRuleDto): Promise<RuleDto> {
    return this.rulesService.createRule(createRuleDto);
  }

  @Get('user/:address')
  @ApiOperation({
    summary: 'Get user automation rules',
    description: 'Retrieve all automation rules for a specific user with filtering options',
  })
  @ApiParam({
    name: 'address',
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiQuery({
    name: 'vaultId',
    description: 'Filter by vault ID',
    required: false,
  })
  @ApiQuery({
    name: 'trigger',
    description: 'Filter by trigger type',
    required: false,
    enum: ['weekly', 'monthly', 'quarterly', 'profit_threshold'],
  })
  @ApiQuery({
    name: 'active',
    description: 'Filter by active status',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search by rule name',
    required: false,
  })
  @ApiQuery({
    name: 'includeExecutions',
    description: 'Include execution history',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Rules retrieved successfully',
    type: RuleListResponseDto,
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
  async getUserRules(
    @Param('address') address: string,
    @Query('vaultId') vaultId?: string,
    @Query('trigger') trigger?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
    @Query('includeExecutions') includeExecutions?: string,
  ): Promise<RuleListResponseDto> {
    const filterDto: RuleFilterDto = {
      address,
      ...(vaultId && { vaultId }),
      ...(trigger && { trigger }),
      ...(active !== undefined && { active: active === 'true' }),
      ...(search && { search }),
      ...(includeExecutions !== undefined && { includeExecutions: includeExecutions === 'true' }),
    };

    return this.rulesService.getRules(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get rule by ID',
    description: 'Retrieve detailed information about a specific automation rule',
  })
  @ApiParam({
    name: 'id',
    description: 'Rule ID',
    example: 'rule123',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address for authorization',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Rule retrieved successfully',
    type: RuleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async getRuleById(
    @Param('id') id: string,
    @Query('userAddress') userAddress: string,
  ): Promise<RuleDto> {
    return this.rulesService.getRuleById(id, userAddress);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update automation rule',
    description: 'Update an existing automation rule with new configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Rule ID',
    example: 'rule123',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address for authorization',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiBody({
    description: 'Rule update data',
    type: UpdateRuleDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Rule updated successfully',
    type: RuleDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid rule configuration',
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async updateRule(
    @Param('id') id: string,
    @Query('userAddress') userAddress: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<RuleDto> {
    return this.rulesService.updateRule(id, updateRuleDto, userAddress);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete automation rule',
    description: 'Delete an automation rule and all its associated data',
  })
  @ApiParam({
    name: 'id',
    description: 'Rule ID',
    example: 'rule123',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address for authorization',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 204,
    description: 'Rule deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(
    @Param('id') id: string,
    @Query('userAddress') userAddress: string,
  ): Promise<void> {
    return this.rulesService.deleteRule(id, userAddress);
  }

  @Put(':id/toggle')
  @ApiOperation({
    summary: 'Toggle rule active status',
    description: 'Enable or disable an automation rule',
  })
  @ApiParam({
    name: 'id',
    description: 'Rule ID',
    example: 'rule123',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address for authorization',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Rule status toggled successfully',
    type: RuleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async toggleRule(
    @Param('id') id: string,
    @Query('userAddress') userAddress: string,
  ): Promise<RuleDto> {
    return this.rulesService.toggleRule(id, userAddress);
  }

  @Post(':id/execute')
  @ApiOperation({
    summary: 'Execute rule manually',
    description: 'Manually trigger the execution of an automation rule',
  })
  @ApiParam({
    name: 'id',
    description: 'Rule ID',
    example: 'rule123',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address for authorization',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Rule executed successfully',
    type: ExecuteRuleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Rule is not active or insufficient profit',
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async executeRule(
    @Param('id') id: string,
    @Query('userAddress') userAddress: string,
  ): Promise<ExecuteRuleResponseDto> {
    return this.rulesService.executeRule(id, userAddress);
  }
}