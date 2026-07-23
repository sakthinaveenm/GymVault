import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Routine } from '../schemas/routine.schema';
import { CreateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(Routine.name) private readonly routineModel: Model<Routine>,
  ) {}

  async create(userId: string, createRoutineDto: CreateRoutineDto) {
    const routine = new this.routineModel({
      ...createRoutineDto,
      userId: new Types.ObjectId(userId),
    });
    await routine.save();

    return {
      success: true,
      message: 'Routine created successfully',
      data: {
        id: routine._id.toString(),
        title: routine.title,
        exercises: routine.exercises,
      },
    };
  }

  async findAll(userId: string) {
    const list = await this.routineModel.find({ userId: new Types.ObjectId(userId) }).exec();
    return {
      success: true,
      message: 'Routines fetched successfully',
      data: list.map((r) => ({
        id: r._id.toString(),
        title: r.title,
        exercises: r.exercises,
      })),
    };
  }

  async remove(userId: string, id: string) {
    const result = await this.routineModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();

    if (!result) {
      throw new NotFoundException('Routine not found or not owned by user');
    }

    return {
      success: true,
      message: 'Routine deleted successfully',
      data: {},
    };
  }
}
