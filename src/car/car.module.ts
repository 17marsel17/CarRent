import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { DatabaseModule } from '../database/database.module';
import { CarRepository } from './car.repository';

@Module({
  providers: [CarService, CarRepository],
  controllers: [CarController],
  imports: [DatabaseModule],
  exports: [CarService],
})
export class CarModule {}
