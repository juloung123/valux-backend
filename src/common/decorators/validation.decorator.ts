import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ethers } from 'ethers';

/**
 * Validates Ethereum addresses
 */
@ValidatorConstraint({ name: 'isEthereumAddress', async: false })
export class IsEthereumAddressConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return ethers.isAddress(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid Ethereum address`;
  }
}

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsEthereumAddressConstraint,
    });
  };
}

/**
 * Validates positive decimal numbers (for financial amounts)
 */
@ValidatorConstraint({ name: 'isPositiveDecimal', async: false })
export class IsPositiveDecimalConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 && isFinite(num);
    }
    if (typeof value === 'number') {
      return value > 0 && isFinite(value);
    }
    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a positive decimal number`;
  }
}

export function IsPositiveDecimal(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsPositiveDecimalConstraint,
    });
  };
}

/**
 * Validates percentage values (0-100)
 */
@ValidatorConstraint({ name: 'isPercentage', async: false })
export class IsPercentageConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a percentage between 0 and 100`;
  }
}

export function IsPercentage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsPercentageConstraint,
    });
  };
}

/**
 * Validates that percentages in an array sum to 100
 */
@ValidatorConstraint({ name: 'percentagesSum100', async: false })
export class PercentagesSum100Constraint implements ValidatorConstraintInterface {
  validate(value: any[]): boolean {
    if (!Array.isArray(value)) return false;
    
    const sum = value.reduce((total, item) => {
      if (typeof item === 'object' && item.percentage !== undefined) {
        return total + parseFloat(item.percentage);
      }
      return total + parseFloat(item);
    }, 0);
    
    // Allow for small floating-point precision errors
    return Math.abs(sum - 100) < 0.01;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} percentages must sum to 100`;
  }
}

export function PercentagesSum100(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: PercentagesSum100Constraint,
    });
  };
}

/**
 * Validates blockchain transaction hash
 */
@ValidatorConstraint({ name: 'isTransactionHash', async: false })
export class IsTransactionHashConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^0x[a-fA-F0-9]{64}$/.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid transaction hash`;
  }
}

export function IsTransactionHash(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsTransactionHashConstraint,
    });
  };
}

/**
 * Validates CUID format (used by Prisma)
 */
@ValidatorConstraint({ name: 'isCuid', async: false })
export class IsCuidConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^[c-h][0-9a-z]{24}$/.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid CUID`;
  }
}

export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [],
      validator: IsCuidConstraint,
    });
  };
}