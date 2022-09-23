import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { RentEntity } from '../entity/rent.entity';
import { AvailableCarDto } from '../car/dto/available-car.dto';
import { CarEntity } from '../entity/car.entity';
import { RentReportInterface } from '../car/interfaces/rent-report.interface';
import * as moment from 'moment';

@Injectable()
export class DatabaseService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    return this.pool.query(queryText, values).then((result: QueryResult) => {
      return result.rows;
    });
  }

  async insertCar(car: CarEntity): Promise<CarEntity[]> {
    return await this.executeQuery(`
      INSERT INTO Car (car_id, number_car)
      VALUES ( $1, $2 );`, [car.car_id, car.number_car]);
  }

  async findCar(carId: string): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT number_car
      FROM Car
      WHERE car_id=$1`, [carId]);
  }

  async findAllCars(): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT car_id FROM Car`);
  }

  async createNewCarRent(rent: RentEntity): Promise<RentEntity[]> {

    return await this.executeQuery(
      `
      INSERT INTO CarRent (car_id, date_to, date_from, price, count_days)
      VALUES (
      $1, $2, $3, $4, $5
      );`,
      [rent.car_id, rent.date_to, rent.date_from, rent.price, rent.count_days],
    );
  }

  async getAvailableCar(
    availableCarDto: AvailableCarDto,
  ): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT car_id
      FROM CarRent
      WHERE date_from BETWEEN $1::DATE + INTERVAL '-3 day' AND $2::DATE + INTERVAL '3 day' AND
            date_to BETWEEN $1::DATE + INTERVAL '-3 day' AND $2::DATE + INTERVAL '3 day' AND 
            car_id=$3`, [availableCarDto.date_from, availableCarDto.date_to, availableCarDto.car_id]);
  }

  async getReport(lastDate: string): Promise<RentReportInterface[]> {
    return await this.executeQuery(`
      SELECT car_id, SUM(count_days)
      as count
      FROM CarRent
      WHERE date_to BETWEEN $1::DATE + INTERVAL '-1 month' AND $1::DATE AND
            date_from BETWEEN $1::DATE + INTERVAL '-1 month' AND $1::DATE
      GROUP BY car_id`, [lastDate]);
  }

  toDateString(date: Date): string {
    const dateString = moment(date).format('YYYY-MM-DD');
    return dateString;
  }
}
