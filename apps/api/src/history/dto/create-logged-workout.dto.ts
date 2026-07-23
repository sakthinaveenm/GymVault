import { IsString, IsArray, ValidateNested, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoggedSetDto {
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
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty()
  @IsString()
  type: string;
}

export class LoggedExerciseDto {
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

  @ApiProperty({ type: [LoggedSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoggedSetDto)
  sets: LoggedSetDto[];
}

export class CreateLoggedWorkoutDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  date: number;

  @ApiProperty()
  @IsNumber()
  durationSeconds: number;

  @ApiProperty({ type: [LoggedExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoggedExerciseDto)
  exercises: LoggedExerciseDto[];
}
