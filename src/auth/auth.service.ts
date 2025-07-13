import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../database/prisma.service';
import { LoginDto, AuthResponseDto, NonceResponseDto } from './dto';

@Injectable()
export class AuthService {
  private readonly nonceStorage = new Map<string, { nonce: string; timestamp: number }>();
  private readonly NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateNonce(address: string): Promise<NonceResponseDto> {
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store nonce with timestamp
    this.nonceStorage.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now(),
    });

    // Clean up expired nonces
    this.cleanupExpiredNonces();

    const message = `Sign this message to authenticate with Valux.finance.

Address: ${address}
Nonce: ${nonce}
Time: ${new Date().toISOString()}

This request will not trigger a blockchain transaction or cost any gas fees.`;

    return {
      nonce,
      message,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { address, signature, message } = loginDto;
    const normalizedAddress = address.toLowerCase();

    // Verify nonce exists and is not expired
    const storedNonce = this.nonceStorage.get(normalizedAddress);
    if (!storedNonce) {
      throw new BadRequestException('No nonce found for this address. Please generate a nonce first.');
    }

    if (Date.now() - storedNonce.timestamp > this.NONCE_EXPIRY) {
      this.nonceStorage.delete(normalizedAddress);
      throw new BadRequestException('Nonce has expired. Please generate a new nonce.');
    }

    // Verify the message contains the correct nonce
    if (!message.includes(storedNonce.nonce)) {
      throw new BadRequestException('Invalid nonce in message.');
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        throw new UnauthorizedException('Invalid signature');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid signature or message format');
    }

    // Remove used nonce
    this.nonceStorage.delete(normalizedAddress);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { address: normalizedAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { address: normalizedAddress },
      });
    }

    // Generate JWT tokens
    const payload = { sub: user.id, address: user.address };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d', // Refresh token lasts longer
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        address: user.address,
        createdAt: user.createdAt,
      },
      expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Verify user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newPayload = { sub: user.id, address: user.address };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '30d',
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          address: user.address,
          createdAt: user.createdAt,
        },
        expires_in: 7 * 24 * 60 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string, address: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.address !== address.toLowerCase()) {
      return null;
    }

    return {
      userId: user.id,
      address: user.address,
    };
  }

  private cleanupExpiredNonces() {
    const now = Date.now();
    for (const [address, data] of this.nonceStorage.entries()) {
      if (now - data.timestamp > this.NONCE_EXPIRY) {
        this.nonceStorage.delete(address);
      }
    }
  }
}
