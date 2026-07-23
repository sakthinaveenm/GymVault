import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Nutrition } from '../schemas/nutrition.schema';
import { User } from '../schemas/user.schema';
import { LogMealDto } from './dto/log-meal.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectModel(Nutrition.name) private readonly nutritionModel: Model<Nutrition>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async logMeal(userId: string, logMealDto: LogMealDto): Promise<Nutrition> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const midnightTimestamp = today.getTime();

    let dailyLog = await this.nutritionModel.findOne({
      userId: new Types.ObjectId(userId),
      date: midnightTimestamp,
    }).exec();

    const newMeal = {
      id: Math.random().toString(36).substring(7),
      name: logMealDto.name,
      calories: logMealDto.calories,
      protein: logMealDto.protein,
      carbs: logMealDto.carbs,
      fat: logMealDto.fat,
      timestamp: Date.now(),
    };

    if (dailyLog) {
      dailyLog.meals.push(newMeal);
      dailyLog.calories += logMealDto.calories;
      dailyLog.protein += logMealDto.protein;
      dailyLog.carbs += logMealDto.carbs;
      dailyLog.fat += logMealDto.fat;
    } else {
      dailyLog = new this.nutritionModel({
        userId: new Types.ObjectId(userId),
        date: midnightTimestamp,
        calories: logMealDto.calories,
        protein: logMealDto.protein,
        carbs: logMealDto.carbs,
        fat: logMealDto.fat,
        meals: [newMeal],
      });
    }

    return dailyLog.save();
  }

  async getLogs(userId: string): Promise<Nutrition[]> {
    return this.nutritionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .exec();
  }

  async updateGoals(userId: string, updateGoalsDto: UpdateGoalsDto): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.nutritionGoals = {
      calories: updateGoalsDto.calories,
      protein: updateGoalsDto.protein,
      carbs: updateGoalsDto.carbs,
      fat: updateGoalsDto.fat,
    };

    await user.save();
    return user.nutritionGoals;
  }

  async getGoals(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Default goals if not defined
    return user.nutritionGoals || { calories: 2000, protein: 150, carbs: 200, fat: 70 };
  }
}
