import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreateRuleDto,
  UpdateRuleDto,
  RuleDto,
  ExecuteRuleResponseDto,
  RuleFilterDto,
  RuleListResponseDto,
} from './dto';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new automation rule
   * @param createRuleDto Rule creation data
   * @returns Created rule
   */
  async createRule(createRuleDto: CreateRuleDto): Promise<RuleDto> {
    this.logger.log(`Creating rule: ${createRuleDto.name} for user: ${createRuleDto.userAddress}`);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { address: createRuleDto.userAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { address: createRuleDto.userAddress },
      });
    }

    // Validate vault exists
    const vault = await this.prisma.vault.findUnique({
      where: { id: createRuleDto.vaultId },
    });

    if (!vault) {
      throw new NotFoundException(`Vault with ID ${createRuleDto.vaultId} not found`);
    }

    // Validate distribution percentages sum to 100
    const totalPercentage = createRuleDto.distributions.reduce(
      (sum, dist) => sum + dist.percentage,
      0
    );

    if (totalPercentage !== 100) {
      throw new BadRequestException(
        `Distribution percentages must sum to 100%, got ${totalPercentage}%`
      );
    }

    // Calculate next execution time
    const nextExecution = this.calculateNextExecution(createRuleDto.trigger);

    // Create rule with distributions
    const rule = await this.prisma.rule.create({
      data: {
        name: createRuleDto.name,
        description: createRuleDto.description || null,
        userId: user.id,
        vaultId: createRuleDto.vaultId,
        trigger: createRuleDto.trigger,
        profitThreshold: createRuleDto.profitThreshold
          ? new Decimal(createRuleDto.profitThreshold)
          : null,
        nextExecution,
        distributions: {
          create: createRuleDto.distributions.map((dist) => ({
            recipient: dist.recipient,
            percentage: dist.percentage,
            description: dist.description || null,
            type: dist.type || 'wallet',
          })),
        },
      },
      include: {
        distributions: true,
        vault: true,
        executions: true,
      },
    });

    return this.transformRuleToDto(rule);
  }

  /**
   * Get all rules for a user
   * @param filterDto Filter parameters
   * @returns List of rules
   */
  async getRules(filterDto: RuleFilterDto): Promise<RuleListResponseDto> {
    this.logger.log(`Getting rules for user: ${filterDto.address}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: filterDto.address },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${filterDto.address} not found`);
    }

    // Build where clause
    const whereClause: any = {
      userId: user.id,
    };

    if (filterDto.vaultId) {
      whereClause.vaultId = filterDto.vaultId;
    }

    if (filterDto.trigger) {
      whereClause.trigger = filterDto.trigger;
    }

    if (filterDto.active !== undefined) {
      whereClause.active = filterDto.active;
    }

    if (filterDto.search) {
      whereClause.OR = [
        { name: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    // Get rules
    const rules = await this.prisma.rule.findMany({
      where: whereClause,
      include: {
        distributions: true,
        vault: true,
        executions: filterDto.includeExecutions ? {
          orderBy: { executedAt: 'desc' },
          take: 10, // Latest 10 executions
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get counts
    const total = rules.length;
    const activeCount = rules.filter(rule => rule.active).length;
    const inactiveCount = total - activeCount;

    return {
      rules: rules.map(rule => this.transformRuleToDto(rule)),
      total,
      activeCount,
      inactiveCount,
    };
  }

  /**
   * Get a specific rule by ID
   * @param ruleId Rule ID
   * @param userAddress User address for authorization
   * @returns Rule details
   */
  async getRuleById(ruleId: string, userAddress: string): Promise<RuleDto> {
    this.logger.log(`Getting rule ${ruleId} for user: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Find rule
    const rule = await this.prisma.rule.findFirst({
      where: {
        id: ruleId,
        userId: user.id,
      },
      include: {
        distributions: true,
        vault: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${ruleId} not found`);
    }

    return this.transformRuleToDto(rule);
  }

  /**
   * Update a rule
   * @param ruleId Rule ID
   * @param updateRuleDto Update data
   * @param userAddress User address for authorization
   * @returns Updated rule
   */
  async updateRule(
    ruleId: string,
    updateRuleDto: UpdateRuleDto,
    userAddress: string
  ): Promise<RuleDto> {
    this.logger.log(`Updating rule ${ruleId} for user: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Find rule
    const existingRule = await this.prisma.rule.findFirst({
      where: {
        id: ruleId,
        userId: user.id,
      },
    });

    if (!existingRule) {
      throw new NotFoundException(`Rule with ID ${ruleId} not found`);
    }

    // Validate distribution percentages if provided
    if (updateRuleDto.distributions) {
      const totalPercentage = updateRuleDto.distributions.reduce(
        (sum, dist) => sum + dist.percentage,
        0
      );

      if (totalPercentage !== 100) {
        throw new BadRequestException(
          `Distribution percentages must sum to 100%, got ${totalPercentage}%`
        );
      }
    }

    // Calculate next execution if trigger changed
    const nextExecution = updateRuleDto.trigger
      ? this.calculateNextExecution(updateRuleDto.trigger)
      : undefined;

    // Prepare update data
    const updateData: any = {
      ...updateRuleDto,
      description: updateRuleDto.description || undefined,
    };
    
    if (updateRuleDto.profitThreshold) {
      updateData.profitThreshold = new Decimal(updateRuleDto.profitThreshold);
    }
    
    if (nextExecution) {
      updateData.nextExecution = nextExecution;
    }
    
    if (updateRuleDto.distributions) {
      updateData.distributions = {
        deleteMany: {},
        create: updateRuleDto.distributions.map((dist) => ({
          recipient: dist.recipient,
          percentage: dist.percentage,
          description: dist.description || null,
          type: dist.type || 'wallet',
        })),
      };
    }

    // Update rule
    const updatedRule = await this.prisma.rule.update({
      where: { id: ruleId },
      data: updateData,
      include: {
        distributions: true,
        vault: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
      },
    });

    return this.transformRuleToDto(updatedRule);
  }

  /**
   * Delete a rule
   * @param ruleId Rule ID
   * @param userAddress User address for authorization
   */
  async deleteRule(ruleId: string, userAddress: string): Promise<void> {
    this.logger.log(`Deleting rule ${ruleId} for user: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Find rule
    const rule = await this.prisma.rule.findFirst({
      where: {
        id: ruleId,
        userId: user.id,
      },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${ruleId} not found`);
    }

    // Delete rule (cascade will handle distributions and executions)
    await this.prisma.rule.delete({
      where: { id: ruleId },
    });
  }

  /**
   * Toggle rule active status
   * @param ruleId Rule ID
   * @param userAddress User address for authorization
   * @returns Updated rule
   */
  async toggleRule(ruleId: string, userAddress: string): Promise<RuleDto> {
    this.logger.log(`Toggling rule ${ruleId} for user: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Find rule
    const rule = await this.prisma.rule.findFirst({
      where: {
        id: ruleId,
        userId: user.id,
      },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${ruleId} not found`);
    }

    // Toggle active status
    const updatedRule = await this.prisma.rule.update({
      where: { id: ruleId },
      data: { active: !rule.active },
      include: {
        distributions: true,
        vault: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
      },
    });

    return this.transformRuleToDto(updatedRule);
  }

  /**
   * Execute a rule manually
   * @param ruleId Rule ID
   * @param userAddress User address for authorization
   * @returns Execution result
   */
  async executeRule(ruleId: string, userAddress: string): Promise<ExecuteRuleResponseDto> {
    this.logger.log(`Executing rule ${ruleId} for user: ${userAddress}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new NotFoundException(`User with address ${userAddress} not found`);
    }

    // Find rule
    const rule = await this.prisma.rule.findFirst({
      where: {
        id: ruleId,
        userId: user.id,
      },
      include: {
        distributions: true,
        vault: true,
      },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${ruleId} not found`);
    }

    if (!rule.active) {
      throw new BadRequestException('Rule is not active');
    }

    // Mock execution logic - in production, this would interact with blockchain
    const mockProfitAmount = new Decimal(Math.random() * 1000 + 100); // Random profit between 100-1100
    const mockGasUsed = new Decimal(0.005);
    const mockGasFee = new Decimal(0.001);
    const mockPerformanceFee = mockProfitAmount.mul(0.005); // 0.5% fee

    // Create execution record
    const execution = await this.prisma.ruleExecution.create({
      data: {
        ruleId: rule.id,
        profitAmount: mockProfitAmount,
        gasUsed: mockGasUsed,
        gasFee: mockGasFee,
        performanceFee: mockPerformanceFee,
        transactions: rule.distributions.map(dist => ({
          recipient: dist.recipient,
          amount: mockProfitAmount.mul(dist.percentage).div(100).toFixed(2),
          type: dist.type,
          hash: `0x${Math.random().toString(16).substring(2, 66)}`, // Mock transaction hash
          status: 'confirmed',
        })),
        status: 'completed',
      },
    });

    // Update rule last execution
    await this.prisma.rule.update({
      where: { id: ruleId },
      data: {
        lastExecuted: new Date(),
        nextExecution: this.calculateNextExecution(rule.trigger),
      },
    });

    return {
      result: 'success',
      execution: {
        id: execution.id,
        ruleId: execution.ruleId,
        executedAt: execution.executedAt.toISOString(),
        profitAmount: execution.profitAmount.toFixed(2),
        gasUsed: execution.gasUsed?.toFixed(8) || '0',
        gasFee: execution.gasFee?.toFixed(8) || '0',
        transactions: execution.transactions as any[],
        status: execution.status,
        ...(execution.errorMessage && { errorMessage: execution.errorMessage }),
        performanceFee: execution.performanceFee?.toFixed(2) || '0',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate next execution time based on trigger
   * @param trigger Trigger type
   * @returns Next execution date
   */
  private calculateNextExecution(trigger: string): Date {
    const now = new Date();
    
    switch (trigger) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      case 'quarterly':
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(now.getMonth() + 3);
        return nextQuarter;
      case 'profit_threshold':
        // For profit threshold, we check more frequently
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Daily check
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default daily
    }
  }

  /**
   * Transform rule entity to DTO
   * @param rule Rule entity
   * @returns Rule DTO
   */
  private transformRuleToDto(rule: any): RuleDto {
    // Calculate total distributed from executions
    const totalDistributed = rule.executions?.reduce(
      (sum: Decimal, exec: any) => sum.add(exec.profitAmount || 0),
      new Decimal(0)
    ) || new Decimal(0);

    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      userAddress: rule.user?.address || '',
      vault: {
        id: rule.vault.id,
        name: rule.vault.name,
        protocol: rule.vault.protocol,
        tokenSymbol: rule.vault.tokenSymbol,
      },
      trigger: rule.trigger,
      profitThreshold: rule.profitThreshold?.toFixed(2),
      active: rule.active,
      lastExecuted: rule.lastExecuted?.toISOString(),
      nextExecution: rule.nextExecution?.toISOString(),
      distributions: rule.distributions.map((dist: any) => ({
        id: dist.id,
        recipient: dist.recipient,
        percentage: dist.percentage,
        description: dist.description,
        type: dist.type,
      })),
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
      executionsCount: rule.executions?.length || 0,
      totalDistributed: totalDistributed.toFixed(2),
    };
  }
}