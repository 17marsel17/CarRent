import { CarController } from './car.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';

const mockService = {
  getCar: jest.fn(),
  getPrice: jest.fn(),
  getReport: jest.fn(),
  createNewRent: jest.fn(),
};

describe('CarController', () => {
  let controller: CarController;
  let service: CarService;

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
    service = module.get<CarService>(CarService);
  });

  it('get car', async () => {
    jest.spyOn(service, 'getCar').mockResolvedValue(true);

    const result = await controller.getCar({
      car_id: '1',
      date_from: new Date('2022-09-22'),
      date_to: new Date('2022-09-22'),
    });

    expect(controller).toBeDefined();
    expect(result).toEqual(true);
  });

  it('get price', async () => {
    jest.spyOn(service, 'getPrice').mockImplementation(() => {
      return 1000;
    });

    const result = await controller.getPrice({
      date_from: new Date('2022-09-22'),
      date_to: new Date('2022-09-22'),
    });

    expect(controller).toBeDefined();
    expect(result).toEqual({ price: 1000 });
  });

  it('get report', async () => {
    jest.spyOn(service, 'getReport').mockResolvedValue({
      total_percent: 100,
      car: [{ car_id: '1', count: 10 }],
    });

    const result = await controller.getReport({
      current_date: new Date('2022-09-22'),
    });

    expect(controller).toBeDefined();
    expect(result).toEqual({
      total_percent: 100,
      car: [{ car_id: '1', count: 10 }],
    });
  });

  it('create new rent', async () => {
    const carRent = {
      id: '1',
      car_id: '1',
      date_from: '2022-09-22',
      date_to: '2022-09-22',
      price: 1000,
      count_days: 1,
    };
    jest.spyOn(service, 'createNewRent').mockResolvedValue(carRent);

    const result = await controller.createNewRent({
      car_id: '1',
      date_from: new Date('2022-09-22'),
      date_to: new Date('2022-09-22'),
    });

    expect(controller).toBeDefined();
    expect(result).toEqual(carRent);
  });
});
