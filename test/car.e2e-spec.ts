import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CarController } from '../src/car/car.controller';
import { CarService } from '../src/car/car.service';

const mockCarRent = {
  car_id: '1',
  date_to: '2022-09-22',
  date_from: '2022-09-22',
  price: 1000,
  count_days: 1,
  current_date: '2022-09-22',
};

const mockService = {
  getCar: jest.fn(),
  getPrice: jest.fn(),
  getReport: jest.fn(),
  createNewRent: jest.fn(),
};

describe('CarController', () => {
  let controller: CarController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarController],
      providers: [
        {
          provide: CarService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CarController>(CarController);
    app = module.createNestApplication();
    await app.init();
  });

  it('available car', async () => {
    return request(app.getHttpServer())
      .get('/car/available')
      .send(mockCarRent)
      .expect(200)
      .expect(mockService.getCar);
  });

  it('get price', async () => {
    return request(app.getHttpServer())
      .get('/car/price')
      .send(mockCarRent)
      .expect(200)
      .expect(mockService.getPrice);
  });

  it('get report', async () => {
    return request(app.getHttpServer())
      .get('/car/report')
      .send(mockCarRent)
      .expect(200)
      .expect(mockService.getReport);
  });

  it('create new rent', async () => {
    return request(app.getHttpServer())
      .post('/car/rent')
      .send(mockCarRent)
      .expect(201)
      .expect(mockService.createNewRent);
  });
});
