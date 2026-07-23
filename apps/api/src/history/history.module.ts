import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { LoggedWorkout, LoggedWorkoutSchema } from '../schemas/logged-workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LoggedWorkout.name, schema: LoggedWorkoutSchema }]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
