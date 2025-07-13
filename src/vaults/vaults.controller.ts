import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VaultsService } from './vaults.service';
import { VaultFilterDto, VaultDto, VaultListResponseDto } from './dto';
import { 
  ApiSuccessResponse, 
  ApiErrorResponse 
} from '@/common/decorators/api-response.decorator';

@ApiTags('Vaults')
@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all vaults with filtering and pagination',
    description: 'Retrieve vaults with advanced filtering options including search, risk level, category, APY range, and more.'
  })
  @ApiSuccessResponse(VaultListResponseDto, 'Successfully retrieved vaults list')
  @ApiErrorResponse(400, 'Invalid filter parameters')
  @ApiErrorResponse(500, 'Internal server error')
  @ApiQuery({ name: 'search', required: false, description: 'Search term for vault name, protocol, or token symbol' })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['low', 'medium', 'high'], description: 'Filter by risk level' })
  @ApiQuery({ name: 'category', required: false, enum: ['stable', 'yield', 'growth'], description: 'Filter by vault category' })
  @ApiQuery({ name: 'minAPY', required: false, type: 'number', description: 'Minimum APY percentage' })
  @ApiQuery({ name: 'maxAPY', required: false, type: 'number', description: 'Maximum APY percentage' })
  @ApiQuery({ name: 'protocol', required: false, description: 'Filter by protocol name' })
  @ApiQuery({ name: 'active', required: false, type: 'boolean', description: 'Show only active vaults (default: true)' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (apy, tvl, name, createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  async findAll(@Query() filterDto: VaultFilterDto): Promise<VaultListResponseDto> {
    return this.vaultsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get vault by ID',
    description: 'Retrieve detailed information about a specific vault.'
  })
  @ApiParam({ name: 'id', description: 'Vault unique identifier (CUID format)' })
  @ApiSuccessResponse(VaultDto, 'Successfully retrieved vault details')
  @ApiErrorResponse(400, 'Invalid vault ID format')
  @ApiErrorResponse(404, 'Vault not found')
  @ApiErrorResponse(500, 'Internal server error')
  async findOne(@Param('id') id: string): Promise<VaultDto> {
    return this.vaultsService.findOne(id);
  }

  @Get(':id/performance')
  @ApiOperation({ 
    summary: 'Get vault performance data',
    description: 'Retrieve historical performance metrics for a specific vault including APY trends and TVL history.'
  })
  @ApiParam({ name: 'id', description: 'Vault unique identifier' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved vault performance data'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Vault not found'
  })
  async getVaultPerformance(@Param('id') id: string) {
    return this.vaultsService.getVaultPerformance(id);
  }

  @Get('address/:address')
  @ApiOperation({ 
    summary: 'Get vault by contract address',
    description: 'Retrieve vault information using the smart contract address.'
  })
  @ApiParam({ name: 'address', description: 'Vault smart contract address' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved vault details',
    type: VaultDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Vault not found'
  })
  async findByAddress(@Param('address') address: string): Promise<VaultDto> {
    return this.vaultsService.findByAddress(address);
  }
}
