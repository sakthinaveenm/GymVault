import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { Nutrition, NutritionSchema } from '../schemas/nutrition.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Nutrition.name, schema: NutritionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NutritionController],
  providers: [NutritionService],
})
export class NutritionModule {}
