import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

export interface JwtPayload {
  sub: string; // User ID
  address: string; // Wallet address
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'dev-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, address } = payload;

    // Verify user still exists in database
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
    });

    if (!user || user.address !== address) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: user.id,
      address: user.address,
    };
  }
}