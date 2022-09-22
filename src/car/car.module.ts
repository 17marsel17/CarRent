import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [CarService],
  controllers: [CarController],
  imports: [DatabaseModule],
  exports: [CarService],
})
export class CarModule {}
