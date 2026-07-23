import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogWeightDto {
  @ApiProperty({ example: 78.5 })
  @IsNumber()
  @IsPositive()
  weight: number;

  @ApiProperty({ example: 1721734200000 })
  @IsNumber()
  @IsPositive()
  date: number;
}
