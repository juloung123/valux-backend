import { IsString, IsNotEmpty, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Wallet address (Ethereum format)',
    example: '0x1234567890abcdef1234567890abcdef12345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  address!: string;

  @ApiProperty({ 
    description: 'Signed message from wallet for authentication',
    example: '0x...'
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;

  @ApiProperty({ 
    description: 'Original message that was signed',
    example: 'Sign this message to authenticate with Valux.finance. Nonce: 123456'
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token!: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refresh_token!: string;

  @ApiProperty({ description: 'User information' })
  user!: {
    id: string;
    address: string;
    createdAt: Date;
  };

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expires_in!: number;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

export class NonceDto {
  @ApiProperty({ 
    description: 'Wallet address to get nonce for',
    example: '0x1234567890abcdef1234567890abcdef12345678'
  })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  address!: string;
}

export class NonceResponseDto {
  @ApiProperty({ description: 'Nonce for signing' })
  nonce!: string;

  @ApiProperty({ description: 'Message to sign' })
  message!: string;
}