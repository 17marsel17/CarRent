import { CarService } from './car.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CarRepository } from './car.repository';
import * as moment from 'moment';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockCarRent = {
  id: '1',
  car_id: '1',
  date_to: new Date('2022-09-22'),
  date_from: new Date('2022-09-22'),
  price: 1000,
  count_days: 1,
  current_date: new Date('2022-09-22'),
};

const mockCar = {
  id: '1',
  car_id: '1',
  number_car: 'E678CB777',
};

const mockRentReport = {
  car_id: '1',
  count: 10,
};

const mockCarRepository = {
  findCar: () => mockCar,
  findAllCars: () => [mockCar, mockCar],
  createNewCarRent: () => mockCarRent,
  getAvailableCar: () => mockCarRent.car_id,
  getReport: () => [mockRentReport],
};

describe('CarService', () => {
  let service: CarService;
  let repository: CarRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: CarRepository,
          useValue: mockCarRepository,
        },
      ],
    }).compile();

    repository = module.get<CarRepository>(CarRepository);
    service = module.get<CarService>(CarService);
  });

  it('get car', async () => {
    jest.spyOn(repository, 'findCar').mockResolvedValue(mockCar);
    jest.spyOn(repository, 'getAvailableCar').mockResolvedValue('1');

    const result = await service.getCar({
      car_id: mockCarRent.car_id,
      date_from: mockCarRent.date_from,
      date_to: mockCarRent.date_to,
    });

    expect(service).toBeDefined();
    expect(result).toEqual(false);
  });

  it('get car', async () => {
    jest.spyOn(repository, 'findCar').mockResolvedValue(mockCar);
    jest.spyOn(repository, 'getAvailableCar').mockResolvedValue('');

    const result = await service.getCar({
      car_id: mockCarRent.car_id,
      date_from: mockCarRent.date_from,
      date_to: mockCarRent.date_to,
    });

    expect(service).toBeDefined();
    expect(result).toEqual(true);
  });

  it('get car', async () => {
    jest.spyOn(repository, 'findCar').mockResolvedValue(mockCar);

    try {
      await service.getCar({
        car_id: mockCarRent.car_id,
        date_from: new Date('2022-09-22'),
        date_to: new Date('2022-09-20'),
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Дата окончания бронирования не может быть меньше даты начала бронирования',
      );
    }
  });

  it('get car', async () => {
    jest.spyOn(repository, 'findCar').mockResolvedValue(null);

    try {
      await service.getCar({
        car_id: '6',
        date_from: new Date('2022-09-22'),
        date_to: new Date('2022-09-22'),
      });
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toBe('Машина с таким carId не существует');
    }
  });

  it('get all cars', async () => {
    jest.spyOn(repository, 'findAllCars').mockResolvedValue([mockCar, mockCar]);

    const result = await service.getAllCars();

    expect(service).toBeDefined();
    expect(result).toEqual([mockCar, mockCar]);
  });

  it('get price', async () => {
    const result = await service.getPrice({
      date_from: mockCarRent.date_from,
      date_to: mockCarRent.date_to,
    });

    expect(service).toBeDefined();
    expect(result).toEqual(1000);
  });

  it('get price', async () => {
    const result = await service.getPrice({
      date_from: new Date('2022-09-26'),
      date_to: new Date('2022-09-30'),
    });

    expect(service).toBeDefined();
    expect(result).toEqual(4950);
  });

  it('get price', async () => {
    const result = await service.getPrice({
      date_from: new Date('2022-09-21'),
      date_to: new Date('2022-09-30'),
    });

    expect(service).toBeDefined();
    expect(result).toEqual(9650);
  });

  it('get price', async () => {
    const result = await service.getPrice({
      date_from: new Date('2022-09-13'),
      date_to: new Date('2022-09-30'),
    });

    expect(service).toBeDefined();
    expect(result).toEqual(16800);
  });

  it('get report', async () => {
    jest.spyOn(repository, 'getReport').mockResolvedValue([mockRentReport]);

    const result = await service.getReport({
      current_date: mockCarRent.current_date,
    });

    expect(service).toBeDefined();
    expect(result).toEqual({
      total_percent: 0.06666666666666667,
      car: [{ car_id: 'E678CB777', count: 0.3333333333333333 }],
    });
  });

  it('create new rent', async () => {
    const carRent = {
      id: mockCarRent.id,
      car_id: mockCarRent.car_id,
      date_from: moment(mockCarRent.date_from).format('YYYY-MM-DD'),
      date_to: moment(mockCarRent.date_to).format('YYYY-MM-DD'),
      count_days: mockCarRent.count_days,
      price: mockCarRent.price,
    };

    jest.spyOn(repository, 'findCar').mockResolvedValue(mockCar);
    jest.spyOn(repository, 'createNewCarRent').mockResolvedValue(carRent);

    const result = await service.createNewRent(mockCarRent);

    expect(service).toBeDefined();
    expect(result).toEqual(carRent);
  });

  it('create new rent', async () => {
    jest.spyOn(repository, 'findCar').mockResolvedValue(mockCar);
    jest.spyOn(repository, 'getAvailableCar').mockResolvedValue('');

    try {
      await service.createNewRent(mockCarRent);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe('Автомобиль не доступен в выбранные даты');
    }
  });

  it('check date', async () => {
    const date = new Date('2022-09-26');

    const result = await service.checkDate(date);

    expect(service).toBeDefined();
    expect(result).toEqual(true);
  });

  it('check date', async () => {
    const date = new Date('2022-09-25');

    try {
      await service.checkDate(date);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Начало и конец аренды может выпадать только на будние дни (пн-пт)',
      );
    }
  });

  it('get count days', async () => {
    const dateFrom = new Date('2022-09-26');
    const dateTo = new Date('2022-09-26');

    const result = await service.getCountDays(dateFrom, dateTo);

    expect(service).toBeDefined();
    expect(result).toEqual(1);
  });

  it('get count days', async () => {
    const dateFrom = new Date('2022-08-20');
    const dateTo = new Date('2022-09-26');

    try {
      await service.getCountDays(dateFrom, dateTo);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe('Максимальный срок аренды 30 дней');
    }
  });
});
