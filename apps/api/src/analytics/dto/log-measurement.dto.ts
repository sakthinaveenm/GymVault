import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogMeasurementDto {
  @ApiProperty({ example: 102.4, required: false })
  @IsNumber()
  @Min(0)
  chest: number;

  @ApiProperty({ example: 84.2, required: false })
  @IsNumber()
  @Min(0)
  waist: number;

  @ApiProperty({ example: 38.5, required: false })
  @IsNumber()
  @Min(0)
  arms: number;

  @ApiProperty({ example: 58.1, required: false })
  @IsNumber()
  @Min(0)
  thighs: number;

  @ApiProperty({ example: 1721734200000 })
  @IsNumber()
  @IsPositive()
  date: number;
}
