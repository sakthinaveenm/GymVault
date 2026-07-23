import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Exercise extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  primaryMuscle: string;

  @Prop({ required: true })
  description: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
