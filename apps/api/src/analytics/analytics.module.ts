import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Weight, WeightSchema } from '../schemas/weight.schema';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';
import { LoggedWorkout, LoggedWorkoutSchema } from '../schemas/logged-workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Weight.name, schema: WeightSchema },
      { name: Measurement.name, schema: MeasurementSchema },
      { name: LoggedWorkout.name, schema: LoggedWorkoutSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
