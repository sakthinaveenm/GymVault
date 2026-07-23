import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoalsDto {
  @ApiProperty({ description: 'Calorie target in kcal' })
  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @ApiProperty({ description: 'Protein target in grams' })
  @IsNotEmpty()
  @IsNumber()
  protein: number;

  @ApiProperty({ description: 'Carbohydrates target in grams' })
  @IsNotEmpty()
  @IsNumber()
  carbs: number;

  @ApiProperty({ description: 'Fats target in grams' })
  @IsNotEmpty()
  @IsNumber()
  fat: number;
}
