/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE IF NOT EXISTS CarRent (
        id SERIAL PRIMARY KEY,
        car_id VARCHAR(10) NOT NULL,
        date_to DATE NOT NULL,
        date_from DATE NOT NULL,
        price FLOAT NOT NULL,
        count_days INTEGER NOT NULL
        );
  `);

  pgm.sql(`CREATE TABLE IF NOT EXISTS Car (
        id SERIAL PRIMARY KEY,
        car_id VARCHAR(10) NOT NULL,
        number_car VARCHAR(9) NOT NULL);`);

  pgm.sql(`INSERT INTO CarRent (car_id, date_to, date_from, price, count_days) 
                 VALUES ('1', '2022-09-23', '2022-09-23', 1000, 1),
                        ('2', '2022-09-15', '2022-09-13', 3000, 3),
                        ('5', '2022-09-21', '2022-09-20', 2000, 2)`);

  pgm.sql(`INSERT INTO Car (car_id, number_car)
                 VALUES ('1', 'А123CB777'),
                        ('2', 'M234СВ777'),
                        ('3', 'P456HO777'),
                        ('4', 'T567TT777'),
                        ('5', 'E678CB777')`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS CarRent`);

  pgm.sql(`DROP TABLE IF EXISTS Car`);
}
