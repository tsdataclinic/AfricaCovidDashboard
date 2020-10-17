import { ApiProperty } from '@nestjs/swagger';

export class CountryStats {
  @ApiProperty({
    description: 'The name of the country',
    examples: ['Spain', 'France', 'Egypt'],
    example: 'Egypt',
  })
  name: string;

  @ApiProperty({
    description: 'Region in which the country resides',
  })
  region: string;

  @ApiProperty({
    description: 'Population of the country',
    examples: [10000, 20000, 30000],
    example: 10000,
  })
  population: number;

  @ApiProperty()
  lnrchange: number;

  @ApiProperty()
  lncaseload_lastobs: number;

  @ApiProperty()
  lnexpo: number;

  @ApiProperty()
  lnsdi: number;

  @ApiProperty()
  lnurban: number;

  @ApiProperty()
  lnp70p: number;

  @ApiProperty()
  lnhhsn: number;

  @ApiProperty()
  lnihr2018: number;

  @ApiProperty()
  lnsqualty: number;

  @ApiProperty()
  lnhiv: number;

  @ApiProperty()
  lnasthma: number;

  @ApiProperty()
  lntraffic: number;

  @ApiProperty()
  nrows: number;
}

export class TrendDatum {
  @ApiProperty({
    description: 'Date of the observation',
  })
  date: Date;

  @ApiProperty({
    description: 'Cumulative number of deaths up to this day',
    minimum: 0,
  })
  deaths: number;

  @ApiProperty({
    description: 'Cumulative number of confirmed up to this day',
    minimum: 0,
  })
  confirmed: number;

  @ApiProperty({
    description: 'Cumulative number of recoveries up to this day',
    minimum: 0,
  })
  recoveries: number;

  @ApiProperty({
    description: 'New number of new deaths this day',
    minimum: 0,
  })
  new_deaths: number;

  @ApiProperty({
    description: 'New number of new cases this day',
    minimum: 0,
  })
  new_case: number;

  @ApiProperty({
    description: 'New number of new recoveries this day',
    minimum: 0,
  })
  new_recoveries: number;

  @ApiProperty({
    description: 'Days since first case',
    minimum: 0,
  })
  days_since_first_case: number;

  add(other: TrendDatum): TrendDatum {
    if (this.date !== other.date) {
      throw new Error(`Trend Datum don't match ${this.date}, ${other.date}`);
    }
    this.deaths += other.deaths;
    this.confirmed += other.confirmed;
    this.recoveries += other.recoveries;
    this.new_deaths += other.new_deaths;
    this.new_case += other.new_case;
    this.new_recoveries += other.new_recoveries;
    return this;
  }
}

export type CountryTrendDict = { [country: string]: TrendDatum[] };
