import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDefined,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNewRentDto {
  @IsString()
  @MaxLength(1)
  @MinLength(1)
  @IsDefined()
  @ApiProperty({ description: 'id машины' })
  car_id: string;

  @ApiProperty({ description: 'Дата окончания бронирования' })
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  date_to: Date;

  @Type(() => Date)
  @IsDate()
  @IsDefined()
  @ApiProperty({ description: 'Дата начала бронирования' })
  date_from: Date;
}
