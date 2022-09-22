import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { RentEntity } from '../entity/rent.entity';
import { AvailableCarDto } from '../car/dto/available-car.dto';
import { CarEntity } from '../entity/car.entity';
import { RentReportInterface } from '../car/interfaces/rent-report.interface';

@Injectable()
export class DatabaseService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    return this.pool.query(queryText, values).then((result: QueryResult) => {
      return result.rows;
    });
  }

  async createRentDatabase() {
    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS CarRent (
        id SERIAL PRIMARY KEY,
        car_id VARCHAR(10) NOT NULL,
        date_to DATE NOT NULL,
        date_from DATE NOT NULL,
        price FLOAT NOT NULL,
        count_days INTEGER NOT NULL
      );`);
  }

  async createCarDatabase() {
    await this.executeQuery(`
      CREATE TABLE IF NOT EXISTS Car (
        id SERIAL PRIMARY KEY,
        car_id VARCHAR(10) NOT NULL,
        number_car VARCHAR(9) NOT NULL);`);
  }

  async insertCar(car: CarEntity): Promise<CarEntity[]> {
    return await this.executeQuery(`
      INSERT INTO Car (car_id, number_car)
      VALUES ( '${car.car_id}', '${car.number_car}' );`);
  }

  async findCar(carId: string): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT number_car
      FROM Car
      WHERE car_id='${carId}'`);
  }

  async findAllCars(): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT * FROM Car`);
  }

  async createNewCarRent(rent: RentEntity): Promise<RentEntity[]> {
    return await this.executeQuery(`
      INSERT INTO CarRent (car_id, date_to, date_from, price, count_days)
      VALUES (
      ${rent.car_id}, '${rent.date_to}', '${rent.date_from}', ${rent.price}, ${rent.count_days}
      );`);
  }

  async getAvailableCar(
    availableCarDto: AvailableCarDto,
  ): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT car_id
      FROM CarRent
      WHERE date_from BETWEEN '${availableCarDto.date_from}'::DATE + INTERVAL '-3 day' AND '${availableCarDto.date_to}'::DATE + INTERVAL '3 day' AND
            date_to BETWEEN '${availableCarDto.date_from}'::DATE + INTERVAL '-3 day' AND '${availableCarDto.date_to}'::DATE + INTERVAL '3 day' AND 
            car_id='${availableCarDto.car_id}'`);
  }

  async getReport(lastDate: string): Promise<RentReportInterface[]> {
    return await this.executeQuery(`
      SELECT car_id, SUM(count_days)
      as count
      FROM CarRent
      WHERE date_to BETWEEN '${lastDate}'::DATE + INTERVAL '-1 month' AND '${lastDate}'::DATE AND
            date_from BETWEEN '${lastDate}'::DATE + INTERVAL '-1 month' AND '${lastDate}'::DATE
      GROUP BY car_id`);
  }
}
