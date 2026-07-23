import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Measurement extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  chest: number;

  @Prop({ required: true, default: 0 })
  waist: number;

  @Prop({ required: true, default: 0 })
  arms: number;

  @Prop({ required: true, default: 0 })
  thighs: number;

  @Prop({ required: true })
  date: number;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement);
