import { ApiProperty } from '@nestjs/swagger';

export class PriceCarDto {
  @ApiProperty({ description: 'Дата начала бронирования' })
  date_from: string;

  @ApiProperty({ description: 'Дата окончания бронирования' })
  date_to: string;
}
