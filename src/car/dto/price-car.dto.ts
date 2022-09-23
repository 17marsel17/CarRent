import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDefined,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceCarDto {
  @IsDateString()
  @Type(() => Date)
  @MinLength(10)
  @MaxLength(10)
  @IsDefined()
  @ApiProperty({ description: 'Дата начала бронирования' })
  date_from: Date;

  @IsDateString()
  @Type(() => Date)
  @MinLength(10)
  @MaxLength(10)
  @IsDefined()
  @ApiProperty({ description: 'Дата окончания бронирования' })
  date_to: Date;
}
