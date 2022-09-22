import { ApiProperty } from '@nestjs/swagger';

export class CreateNewRentDto {
  @ApiProperty({ description: 'id машины' })
  car_id: string;

  @ApiProperty({ description: 'Дата окончания бронирования' })
  date_to: string;

  @ApiProperty({ description: 'Дата начала бронирования' })
  date_from: string;
}
