import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { AvailableCarDto } from './dto/available-car.dto';
import { PriceCarDto } from './dto/price-car.dto';
import { DatabaseService } from '../database/database.service';
import { CreateNewRentDto } from './dto/create-new-rent.dto';
import * as moment from 'moment';
import { RentEntity } from '../entity/rent.entity';
import { ReportDto } from './dto/report.dto';

@Injectable()
export class CarService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getCar(availableCarDto: AvailableCarDto): Promise<boolean> {
    this.checkDate(availableCarDto.dateTo);
    this.checkDate(availableCarDto.dateFrom);

    if (
      moment(availableCarDto.dateTo, 'YYYY-MM-DD') <
      moment(availableCarDto.dateFrom, 'YYYY_MM_DD')
    ) {
      throw new BadRequestException(
        'Дата окончания бронирования не может быть меньше даты начала бронирования',
      );
    }

    const result = await this.databaseService.getAvailableCar(availableCarDto);

    console.log('result', result);

    if (result.length) {
      return false;
    }
    return true;
  }

  getPrice(priceCarDto: PriceCarDto): number {
    const days = this.getCountDays(priceCarDto.dateFrom, priceCarDto.dateTo);

    if (days > 30) {
      throw new Error('Максимальный срок аренды 30 дней');
    }

    const basePrice = Number(process.env.BASE_PRICE);

    let price = 0;
    for (let i = 1; i <= days; i++) {
      if (i <= 4) {
        price += basePrice;
      } else if (i <= 9) {
        price += basePrice * 0.95;
      } else if (i <= 17) {
        price += basePrice * 0.9;
      } else if (i <= 29) {
        price += basePrice * 0.85;
      }
    }

    return price;
  }

  async getReport(reportDto: ReportDto) {
    const firstDate = moment(reportDto.currentDate)
      .subtract(30, 'days')
      .toString();
    const result = await this.databaseService.getReport(
      firstDate,
      reportDto.currentDate,
    );

    result.map((data) => {
      data.count /= 30;
    });

    let total_percent = 0;
    result.forEach((data) => {
      total_percent += data.count;
    });

    return {
      total_percent: total_percent,
      car: result,
    };
  }

  async createNewRent(
    createNewRentDto: CreateNewRentDto,
  ): Promise<RentEntity[]> {
    const available = await this.getCar({
      carId: createNewRentDto.carId,
      dateFrom: createNewRentDto.dateFrom,
      dateTo: createNewRentDto.dateTo,
    });

    if (!available) {
      throw new BadRequestException('Автомобиль не доступен в выбранные даты');
    }

    const price = this.getPrice({
      dateFrom: createNewRentDto.dateFrom,
      dateTo: createNewRentDto.dateTo,
    });

    const newRent: RentEntity = {
      carId: createNewRentDto.carId,
      dateFrom: createNewRentDto.dateFrom,
      dateTo: createNewRentDto.dateTo,
      price: price,
      countDays: this.getCountDays(
        createNewRentDto.dateFrom,
        createNewRentDto.dateTo,
      ),
    };
    return this.databaseService.createNewCarRent(newRent);
  }

  checkDate(date: string): boolean {
    const weekDay = moment(date).weekday();
    if (weekDay === 6 || weekDay === 0) {
      throw new BadRequestException(
        'Начало и конец аренды может выпадать только на будние дни (пн-пт)',
      );
    }

    return true;
  }

  async initDb() {
    await this.databaseService.createRentDatabase();

    const dateFrom = moment(new Date()).format('yyyy-MM-DD');

    const price = this.getPrice({
      dateFrom: dateFrom,
      dateTo: dateFrom,
    });

    await this.databaseService.createNewCarRent({
      carId: '1',
      dateTo: dateFrom,
      dateFrom: dateFrom,
      price: price,
      countDays: this.getCountDays(dateFrom, dateFrom),
    });
  }

  getCountDays(dateFrom: string, dateTo: string): number {
    const startRent = moment(dateFrom, 'YYYY-MM-DD');
    const endRent = moment(dateTo, 'YYYY-MM-DD');
    let days = endRent.diff(startRent, 'days') + 1;

    return days;
  }
}
