import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class LoggedSet {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: true, default: false })
  isCompleted: boolean;

  @Prop({ required: true, default: 'normal' })
  type: string;
}

const LoggedSetSchema = SchemaFactory.createForClass(LoggedSet);

@Schema()
class LoggedExercise {
  @Prop({ required: true })
  exerciseId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  primaryMuscle: string;

  @Prop({ type: [LoggedSetSchema], default: [] })
  sets: LoggedSet[];
}

const LoggedExerciseSchema = SchemaFactory.createForClass(LoggedExercise);

@Schema({ timestamps: true })
export class LoggedWorkout extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: number;

  @Prop({ required: true })
  durationSeconds: number;

  @Prop({ type: [LoggedExerciseSchema], default: [] })
  exercises: LoggedExercise[];
}

export const LoggedWorkoutSchema = SchemaFactory.createForClass(LoggedWorkout);
