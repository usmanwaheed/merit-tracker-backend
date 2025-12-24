import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuperadminRegisterDto {
  @ApiProperty({
    description: 'Email address of the superadmin',
    example: 'superadmin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'First name of the superadmin',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;


  @ApiProperty({
    description: 'Last name of the superadmin',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Password for the superadmin account',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirm password for the superadmin account',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}

export class SuperadminLoginDto {
  @ApiProperty({
    description: 'Email address of the superadmin',
    example: 'superadmin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the superadmin account',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
