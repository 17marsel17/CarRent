import { ApiProperty } from '@nestjs/swagger';

export class ReportDto {
  @ApiProperty({ description: 'Дата, на которую запрашивается отчет' })
  current_date: string;
}
