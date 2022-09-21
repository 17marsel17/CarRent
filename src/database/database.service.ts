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
      CREATE_TABLE CarRent(
        id VARCHAR(30) PRIMARY KEY,
        carId VARCHAR(10) NOT NULL,
        dateTo DATE NOT NULL,
        dateFrom DATE NOT NULL,
        price FLOAT NOT NULL
      )`);
  }

  async createNewCarRent(rent: RentEntity): Promise<RentEntity[]> {
    return await this.executeQuery(`
      INSERT INTO CarRent (carId, dateTo, dateFrom, price)
      VALUES (${(rent.carId, rent.dateTo, rent.dateFrom, rent.price)})`);
  }

  async getAvailableCar(
    availableCarDto: AvailableCarDto,
  ): Promise<CarEntity[]> {
    return await this.executeQuery(`
      SELECT carId
      FROM CarRent
      WHERE dateTo=${availableCarDto.dateTo} AND 
            dateFrom=${availableCarDto.dateFrom} AND
            carId=${availableCarDto.carId}`);
  }

  async getReport(
    firstDate: string,
    lastDate: string,
  ): Promise<RentReportInterface[]> {
    return await this.executeQuery(`
      SELECT carId, SUM(
        CASE
          WHEN (dateTo = dateFrom) THEN 1
          ELSE dateTo - dateFrom
          END
      )
      as count
      FROM CarRent
      WHERE dateTo BETWEEN (${firstDate} AND ${lastDate}) AND
            dateFrom BETWEEN (${firstDate} AND ${lastDate}) AND
            dateTo < dateFrom`);
  }
}
