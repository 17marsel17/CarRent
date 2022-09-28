import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceCarDto {
  @Type(() => Date)
  @IsDate()
  @IsDefined()
  @ApiProperty({ description: 'Дата начала бронирования' })
  date_from: Date;

  @ApiProperty({ description: 'Дата окончания бронирования' })
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  date_to: Date;
}
