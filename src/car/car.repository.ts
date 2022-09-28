import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CarEntity } from '../entity/car.entity';
import { RentEntity } from '../entity/rent.entity';
import { AvailableCarDto } from './dto/available-car.dto';
import { RentReportInterface } from './interfaces/rent-report.interface';

@Injectable()
export class CarRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async insertCar(car: CarEntity): Promise<CarEntity[]> {
    const databaseResponse = await this.databaseService.executeQuery<CarEntity>(
      `
      INSERT INTO Car (car_id, number_car)
      VALUES ( $1, $2 );`,
      [car.car_id, car.number_car],
    );

    return databaseResponse;
  }

  async findCar(carId: string): Promise<CarEntity | null> {
    const databaseResponse = await this.databaseService.executeQuery<CarEntity>(
      `
      SELECT number_car
      FROM Car
      WHERE car_id=$1
      LIMIT 1`,
      [carId],
    );

    return databaseResponse[0];
  }

  async findAllCars(): Promise<CarEntity[]> {
    const databaseResponse = await this.databaseService
      .executeQuery<CarEntity>(`
      SELECT car_id FROM Car`);

    return databaseResponse;
  }

  async createNewCarRent(rent: RentEntity): Promise<RentEntity> {
    const databaseResponse =
      await this.databaseService.executeQuery<RentEntity>(
        `
      INSERT INTO CarRent (car_id, date_to, date_from, price, count_days)
      VALUES (
      $1, $2, $3, $4, $5
      );`,
        [
          rent.car_id,
          rent.date_to,
          rent.date_from,
          rent.price,
          rent.count_days,
        ],
      );

    return databaseResponse[0];
  }

  async getAvailableCar(availableCarDto: AvailableCarDto): Promise<string> {
    const databaseResponse = await this.databaseService.executeQuery<string>(
      `
      SELECT car_id
      FROM CarRent
      WHERE date_from BETWEEN $1::DATE + INTERVAL '-3 day' AND $2::DATE + INTERVAL '3 day' AND
            date_to BETWEEN $1::DATE + INTERVAL '-3 day' AND $2::DATE + INTERVAL '3 day' AND 
            car_id=$3`,
      [
        availableCarDto.date_from,
        availableCarDto.date_to,
        availableCarDto.car_id,
      ],
    );

    return databaseResponse[0];
  }

  async getReport(lastDate: string): Promise<RentReportInterface[]> {
    return await this.databaseService.executeQuery(
      `
      SELECT car_id, SUM(count_days)
      as count
      FROM CarRent
      WHERE date_to BETWEEN $1::DATE + INTERVAL '-1 month' AND $1::DATE AND
            date_from BETWEEN $1::DATE + INTERVAL '-1 month' AND $1::DATE
      GROUP BY car_id`,
      [lastDate],
    );
  }
}
