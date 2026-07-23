import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogMealDto {
  @ApiProperty({ description: 'Name of the food item' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Calorie count in kcal' })
  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @ApiProperty({ description: 'Protein count in grams' })
  @IsNotEmpty()
  @IsNumber()
  protein: number;

  @ApiProperty({ description: 'Carbohydrates in grams' })
  @IsNotEmpty()
  @IsNumber()
  carbs: number;

  @ApiProperty({ description: 'Fats count in grams' })
  @IsNotEmpty()
  @IsNumber()
  fat: number;
}
