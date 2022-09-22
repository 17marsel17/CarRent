import { Body, Controller, Get, Post } from '@nestjs/common';
import { CarService } from './car.service';
import { AvailableCarDto } from './dto/available-car.dto';
import { PriceCarDto } from './dto/price-car.dto';
import { CreateNewRentDto } from './dto/create-new-rent.dto';
import { ReportDto } from './dto/report.dto';

@Controller('/car')
export class CarController {
  constructor(private carService: CarService) {}

  @Get()
  getCar(@Body() availableCarDto: AvailableCarDto) {
    return this.carService.getCar(availableCarDto);
  }

  @Get('/price')
  getPrice(@Body() priceCarDto: PriceCarDto): { price: number } {
    return { price: this.carService.getPrice(priceCarDto) };
  }

  @Get('/report')
  getReport(@Body() reportDto: ReportDto) {
    return this.carService.getReport(reportDto);
  }

  @Post('/rent')
  createNewRent(@Body() createNewRentDto: CreateNewRentDto) {
    return this.carService.createNewRent(createNewRentDto);
  }

  @Get('/init')
  initDb() {
    return this.carService.initDb();
  }
}
