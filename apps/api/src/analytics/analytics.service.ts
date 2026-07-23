import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Weight } from '../schemas/weight.schema';
import { Measurement } from '../schemas/measurement.schema';
import { LoggedWorkout } from '../schemas/logged-workout.schema';
import { LogWeightDto } from './dto/log-weight.dto';
import { LogMeasurementDto } from './dto/log-measurement.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Weight.name) private readonly weightModel: Model<Weight>,
    @InjectModel(Measurement.name) private readonly measurementModel: Model<Measurement>,
    @InjectModel(LoggedWorkout.name) private readonly loggedWorkoutModel: Model<LoggedWorkout>,
  ) {}

  async logWeight(userId: string, logWeightDto: LogWeightDto) {
    const entry = new this.weightModel({
      ...logWeightDto,
      userId: new Types.ObjectId(userId),
    });
    await entry.save();
    return {
      success: true,
      message: 'Body weight logged successfully',
      data: {
        id: entry._id.toString(),
        weight: entry.weight,
        date: entry.date,
      },
    };
  }

  async findWeights(userId: string) {
    const list = await this.weightModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: 1 }) // Chronological order
      .exec();

    return {
      success: true,
      message: 'Weight logs retrieved successfully',
      data: list.map((w) => ({
        id: w._id.toString(),
        weight: w.weight,
        date: w.date,
      })),
    };
  }

  async logMeasurements(userId: string, logMeasurementDto: LogMeasurementDto) {
    const entry = new this.measurementModel({
      ...logMeasurementDto,
      userId: new Types.ObjectId(userId),
    });
    await entry.save();
    return {
      success: true,
      message: 'Body measurements logged successfully',
      data: {
        id: entry._id.toString(),
        chest: entry.chest,
        waist: entry.waist,
        arms: entry.arms,
        thighs: entry.thighs,
        date: entry.date,
      },
    };
  }

  async findMeasurements(userId: string) {
    const list = await this.measurementModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: 1 }) // Chronological order
      .exec();

    return {
      success: true,
      message: 'Measurement logs retrieved successfully',
      data: list.map((m) => ({
        id: m._id.toString(),
        chest: m.chest,
        waist: m.waist,
        arms: m.arms,
        thighs: m.thighs,
        date: m.date,
      })),
    };
  }

  async findPersonalRecords(userId: string) {
    const workouts = await this.loggedWorkoutModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();

    const prMap = new Map<
      string,
      {
        exerciseId: string;
        name: string;
        category: string;
        primaryMuscle: string;
        weight: number;
        reps: number;
        date: number;
      }
    >();

    for (const workout of workouts) {
      for (const ex of workout.exercises) {
        const completedSets = ex.sets.filter((s) => s.isCompleted);
        if (completedSets.length === 0) continue;

        // Find set with maximum weight in this workout
        const maxSet = completedSets.reduce(
          (max, s) => (s.weight > max.weight ? s : max),
          completedSets[0]
        );
        const existing = prMap.get(ex.exerciseId);

        if (!existing || maxSet.weight > existing.weight) {
          prMap.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            name: ex.name,
            category: ex.category,
            primaryMuscle: ex.primaryMuscle,
            weight: maxSet.weight,
            reps: maxSet.reps,
            date: workout.date,
          });
        }
      }
    }

    return {
      success: true,
      message: 'Personal records calculated successfully',
      data: Array.from(prMap.values()),
    };
  }
}
