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
        carId VARCHAR(10) NOT NULL,
        dateTo DATE NOT NULL,
        dateFrom DATE NOT NULL,
        price FLOAT NOT NULL,
        countDays INTEGER NOT NULL
      );`);
  }

  async createNewCarRent(rent: RentEntity): Promise<RentEntity[]> {
    console.log(rent);
    return await this.executeQuery(`
      INSERT INTO CarRent (carId, dateTo, dateFrom, price, countDays)
      VALUES (
      ${rent.carId}, '${rent.dateTo}', '${rent.dateFrom}', ${rent.price}, ${rent.countDays}
      );`);
  }

  async getAvailableCar(
    availableCarDto: AvailableCarDto,
  ): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT carId
      FROM CarRent
      WHERE dateFrom BETWEEN '${availableCarDto.dateFrom}'::DATE + INTERVAL '-3 day' AND '${availableCarDto.dateTo}'::DATE + INTERVAL '3 day' AND
            dateTo BETWEEN '${availableCarDto.dateFrom}'::DATE + INTERVAL '-3 day' AND '${availableCarDto.dateTo}'::DATE + INTERVAL '3 day' AND 
            carId='${availableCarDto.carId}'`);
  }

  async getReport(
    firstDate: string,
    lastDate: string,
  ): Promise<RentReportInterface[]> {
    return await this.executeQuery(`
      SELECT carId, SUM(countDays)
      as count
      FROM CarRent
      WHERE dateTo BETWEEN '${firstDate}'::DATE AND '${lastDate}'::DATE AND
            dateFrom BETWEEN '${firstDate}'::DATE AND '${lastDate}'::DATE AND
            dateTo < dateFrom`);
  }
}
