import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoggedWorkout } from '../schemas/logged-workout.schema';
import { CreateLoggedWorkoutDto } from './dto/create-logged-workout.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(LoggedWorkout.name) private readonly loggedWorkoutModel: Model<LoggedWorkout>,
  ) {}

  async create(userId: string, createLoggedWorkoutDto: CreateLoggedWorkoutDto) {
    const workout = new this.loggedWorkoutModel({
      ...createLoggedWorkoutDto,
      userId: new Types.ObjectId(userId),
    });
    await workout.save();

    return {
      success: true,
      message: 'Workout logged successfully',
      data: {
        id: workout._id.toString(),
        title: workout.title,
        date: workout.date,
        durationSeconds: workout.durationSeconds,
        exercises: workout.exercises,
      },
    };
  }

  async findAll(userId: string) {
    const list = await this.loggedWorkoutModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 }) // Sort by newest date
      .exec();

    return {
      success: true,
      message: 'Workout history fetched successfully',
      data: list.map((w) => ({
        id: w._id.toString(),
        title: w.title,
        date: w.date,
        durationSeconds: w.durationSeconds,
        exercises: w.exercises,
      })),
    };
  }
}
