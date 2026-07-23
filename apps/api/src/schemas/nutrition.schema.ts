import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class MealLog {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  calories: number;

  @Prop({ required: true })
  protein: number;

  @Prop({ required: true })
  carbs: number;

  @Prop({ required: true })
  fat: number;

  @Prop({ required: true })
  timestamp: number;
}

@Schema({ timestamps: true })
export class Nutrition extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  calories: number;

  @Prop({ required: true })
  protein: number;

  @Prop({ required: true })
  carbs: number;

  @Prop({ required: true })
  fat: number;

  @Prop({ required: true })
  date: number; // Start of the day timestamp

  @Prop({ type: [MealLog], default: [] })
  meals: MealLog[];
}

export const NutritionSchema = SchemaFactory.createForClass(Nutrition);
