import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    this.logger.debug(`Execution query: ${queryText} (${values})`);
    return this.pool.query(queryText, values).then((result: QueryResult) => {
      return result.rows;
    });
  }
}
