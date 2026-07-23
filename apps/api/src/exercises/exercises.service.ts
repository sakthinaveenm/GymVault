import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from '../schemas/exercise.schema';

const SEED_EXERCISES = [
  { name: 'Barbell Bench Press', category: 'Barbell', primaryMuscle: 'Chest', description: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower it to your chest, and press up.' },
  { name: 'Dumbbell Incline Press', category: 'Dumbbell', primaryMuscle: 'Chest', description: 'Sit on an incline bench, press dumbbells upwards from shoulder height.' },
  { name: 'Barbell Squat', category: 'Barbell', primaryMuscle: 'Legs', description: 'Rest barbell on traps, bend knees and hips to squat down, keep chest up, and stand back up.' },
  { name: 'Barbell Deadlift', category: 'Barbell', primaryMuscle: 'Back', description: 'Lift barbell from the ground to hip level, keeping your back straight and engaging glutes/hamstrings.' },
  { name: 'Overhead Press', category: 'Barbell', primaryMuscle: 'Shoulders', description: 'Press barbell overhead from collarbone level while standing.' },
  { name: 'Pull Up', category: 'Bodyweight', primaryMuscle: 'Back', description: 'Hang from a bar and pull your chest to the bar using your back and biceps.' },
  { name: 'Dumbbell Bicep Curl', category: 'Dumbbell', primaryMuscle: 'Arms', description: 'Hold dumbbells by sides and curl them upwards while keeping elbows pinned.' },
  { name: 'Cable Tricep Pushdown', category: 'Machine', primaryMuscle: 'Arms', description: 'Push cable attachment downwards by extending elbows.' },
  { name: 'Dumbbell Lateral Raise', category: 'Dumbbell', primaryMuscle: 'Shoulders', description: 'Raise dumbbells outwards to the sides to shoulder height.' },
  { name: 'Lying Leg Curl', category: 'Machine', primaryMuscle: 'Legs', description: 'Lie face down and curl the leg roller towards glutes.' },
  { name: 'Leg Extension', category: 'Machine', primaryMuscle: 'Legs', description: 'Sit and extend knees to lift the roller pad.' },
  { name: 'Plank', category: 'Bodyweight', primaryMuscle: 'Core', description: 'Hold a push-up position resting on forearms, maintaining a straight line.' },
  { name: 'Cable Seated Row', category: 'Machine', primaryMuscle: 'Back', description: 'Sit at cable station and pull handle towards lower abdomen.' },
  { name: 'Push Up', category: 'Bodyweight', primaryMuscle: 'Chest', description: 'Classic push-up from the floor keeping body straight.' },
];

@Injectable()
export class ExercisesService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.exerciseModel.countDocuments().exec();
    if (count === 0) {
      console.log('[Database Seeder] Seeding standard exercise database...');
      await this.exerciseModel.insertMany(SEED_EXERCISES);
      console.log(`[Database Seeder] Seeded ${SEED_EXERCISES.length} exercises successfully.`);
    }
  }

  async findAll(search?: string) {
    let filter = {};
    if (search) {
      filter = { name: { $regex: search, $options: 'i' } };
    }
    const list = await this.exerciseModel.find(filter).exec();
    
    // Map database entries to match mobile's required properties
    return {
      success: true,
      message: 'Exercises fetched successfully',
      data: list.map((e) => ({
        id: e._id.toString(),
        name: e.name,
        category: e.category,
        primaryMuscle: e.primaryMuscle,
        description: e.description,
      })),
    };
  }
}
