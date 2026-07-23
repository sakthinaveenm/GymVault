import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class RoutineSet {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: true, default: 'normal' })
  type: string;
}

const RoutineSetSchema = SchemaFactory.createForClass(RoutineSet);

@Schema()
class RoutineExercise {
  @Prop({ required: true })
  exerciseId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  primaryMuscle: string;

  @Prop({ type: [RoutineSetSchema], default: [] })
  sets: RoutineSet[];
}

const RoutineExerciseSchema = SchemaFactory.createForClass(RoutineExercise);

@Schema({ timestamps: true })
export class Routine extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [RoutineExerciseSchema], default: [] })
  exercises: RoutineExercise[];
}

export const RoutineSchema = SchemaFactory.createForClass(Routine);
export { RoutineExerciseSchema, RoutineSetSchema };
