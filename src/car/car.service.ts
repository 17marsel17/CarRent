import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailableCarDto } from './dto/available-car.dto';
import { PriceCarDto } from './dto/price-car.dto';
import { DatabaseService } from '../database/database.service';
import { CreateNewRentDto } from './dto/create-new-rent.dto';
import * as moment from 'moment';
import { RentEntity } from '../entity/rent.entity';
import { ReportDto } from './dto/report.dto';
import { CarEntity } from '../entity/car.entity';

@Injectable()
export class CarService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getCar(availableCarDto: AvailableCarDto): Promise<boolean> {
    this.getCountDays(availableCarDto.date_from, availableCarDto.date_to);

    const cars = await this.getAllCars();

    const car = cars.find((el) => el.car_id === availableCarDto.car_id);

    if (!car) {
      throw new NotFoundException('Машина с таким carId не существует');
    }

    this.checkDate(availableCarDto.date_to);
    this.checkDate(availableCarDto.date_from);

    if (
      moment(availableCarDto.date_to, 'YYYY-MM-DD') <
      moment(availableCarDto.date_from, 'YYYY-MM-DD')
    ) {
      throw new BadRequestException(
        'Дата окончания бронирования не может быть меньше даты начала бронирования',
      );
    }

    const result = await this.databaseService.getAvailableCar(availableCarDto);

    if (result.length) {
      return false;
    }
    return true;
  }

  async getAllCars(): Promise<CarEntity[]> {
    return await this.databaseService.findAllCars();
  }

  getPrice(priceCarDto: PriceCarDto): number {
    const days = this.getCountDays(priceCarDto.date_from, priceCarDto.date_to);

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
    const result = await this.databaseService.getReport(
      moment(reportDto.current_date).format('YYYY-MM-DD'),
    );

    const cars: CarEntity[] = await this.getAllCars();

    result.map((data) => {
      data.count /= 30;

      data.car_id =
        cars.find((el) => el.car_id === data.car_id)?.number_car || data.car_id;
    });

    let total_percent = 0;
    result.forEach((data) => {
      total_percent += data.count;
    });

    return {
      total_percent: total_percent / 5,
      car: result,
    };
  }

  async createNewRent(
    createNewRentDto: CreateNewRentDto,
  ): Promise<RentEntity[]> {
    const available = await this.getCar({
      car_id: createNewRentDto.car_id,
      date_from: createNewRentDto.date_from,
      date_to: createNewRentDto.date_to,
    });

    if (!available) {
      throw new BadRequestException('Автомобиль не доступен в выбранные даты');
    }

    const price = this.getPrice({
      date_from: createNewRentDto.date_from,
      date_to: createNewRentDto.date_to,
    });

    const newRent: RentEntity = {
      car_id: createNewRentDto.car_id,
      date_from: moment(createNewRentDto.date_from).format('YYYY-MM-DD'),
      date_to: moment(createNewRentDto.date_to).format('YYYY-MM-DD'),
      price: price,
      count_days: this.getCountDays(
        createNewRentDto.date_from,
        createNewRentDto.date_to,
      ),
    };
    return this.databaseService.createNewCarRent(newRent);
  }

  checkDate(date: Date): boolean {
    const weekDay = moment(date).weekday();
    if (weekDay === 6 || weekDay === 0) {
      throw new BadRequestException(
        'Начало и конец аренды может выпадать только на будние дни (пн-пт)',
      );
    }

    return true;
  }

  async initDb() {

    const dateFrom = new Date();

    const price = this.getPrice({
      date_from: dateFrom,
      date_to: dateFrom,
    });

    await this.databaseService.createNewCarRent({
      car_id: '1',
      date_to: moment(dateFrom).format('YYYY-MM-DD'),
      date_from: moment(dateFrom).format('YYYY-MM-DD'),
      price: price,
      count_days: this.getCountDays(dateFrom, dateFrom),
    });
  }

  getCountDays(dateFrom: Date, dateTo: Date): number {
    const startRent = moment(dateFrom, 'YYYY-MM-DD');
    const endRent = moment(dateTo, 'YYYY-MM-DD');
    let days = endRent.diff(startRent, 'days') + 1;

    if (days > 30) {
      throw new BadRequestException('Максимальный срок аренды 30 дней');
    }

    return days;
  }
}
