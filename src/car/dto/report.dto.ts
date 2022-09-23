import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReportDto {
  @IsDate()
  @Type(() => Date)
  @IsDefined()
  @ApiProperty({ description: 'Дата, на которую запрашивается отчет' })
  current_date: Date;
}
