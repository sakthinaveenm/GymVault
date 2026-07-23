import { IsString, IsArray, ValidateNested, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RoutineSetDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty()
  @IsNumber()
  reps: number;

  @ApiProperty()
  @IsString()
  type: string;
}

export class RoutineExerciseDto {
  @ApiProperty()
  @IsString()
  exerciseId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString()
  primaryMuscle: string;

  @ApiProperty({ type: [RoutineSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineSetDto)
  sets: RoutineSetDto[];
}

export class CreateRoutineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [RoutineExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises: RoutineExerciseDto[];
}
