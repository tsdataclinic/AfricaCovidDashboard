import { ApiProperty } from '@nestjs/swagger';

export class Country {
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
    description: 'The continent where the country is located',
  })
  continent: string;

  @ApiProperty({
    description: 'The Iso3 string for the country',
  })
  iso3: string;
}

export class RegionStats {
  @ApiProperty({
    description: 'Stats for each region',
    examples: ['CentralAfrica'],
    example: 'CentralAfrica',
  })
  name: string;

  @ApiProperty({
    description: 'Population of the region',
    examples: [10000, 20000],
    example: 1000,
  })
  population: number;

  constructor(name: string, population: number) {
    this.name = name;
    this.population = population;
  }
}

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
    description: 'The continent where the country is located',
  })
  continent: string;

  @ApiProperty({
    description: 'The Iso3 string for the country',
  })
  iso3: string;

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
  deaths: number | null;

  @ApiProperty({
    description: 'Cumulative number of confirmed up to this day',
    minimum: 0,
  })
  confirmed: number | null;

  @ApiProperty({
    description: 'Cumulative number of recoveries up to this day',
    minimum: 0,
  })
  recoveries: number | null;

  @ApiProperty({
    description: 'New number of new deaths this day',
    minimum: 0,
  })
  new_deaths: number | null;

  @ApiProperty({
    description: 'New number of new cases this day',
    minimum: 0,
  })
  new_case: number | null;

  @ApiProperty({
    description: 'New number of new recoveries this day',
    minimum: 0,
  })
  new_recoveries: number | null;

  @ApiProperty({
    description: 'Days since first case',
    minimum: 0,
  })
  days_since_first_case: number | null;

  @ApiProperty({
    description: 'is this data point a prediction or an observation',
  })
  isPrediction: boolean;

  @ApiProperty({
    description: 'Model exposure',
    nullable: true,
  })
  exposure: number | null;

  @ApiProperty({
    description: 'Cumulative cases prediction',
    nullable: true,
  })
  confirmed_prediction: number | null;

  @ApiProperty({
    description: 'Upper limit of cumulative cases prediction ',
    nullable: true,
  })
  confirmed_prediction_upper: number | null;

  @ApiProperty({
    description: 'Upper limit of cumulative cases prediction ',
    nullable: true,
  })
  confirmed_prediction_lower: number | null;

  @ApiProperty({
    description: 'Lower limit of predicted daily cases',
    nullable: true,
  })
  daily_prediction_lower: number | null;

  @ApiProperty({
    description: 'Upper limit of predicted daily cases ',
    nullable: true,
  })
  daily_prediction_upper: number | null;

  @ApiProperty({
    description: 'Daily predicted cases',
    nullable: true,
  })
  daily_prediction: number | null;

  add(other: TrendDatum): TrendDatum {
    if (this.isPrediction) {
      // console.log('self is ', this, ' other is ', other);
    }
    if (!datesAreOnSameDay(this.date, other.date)) {
      throw new Error(`Trend Datum don't match ${this.date}, ${other.date}`);
    }
    let newObs = new TrendDatum();
    newObs.deaths = this.deaths + other.deaths;
    newObs.confirmed = this.confirmed + other.confirmed;
    newObs.recoveries = this.recoveries + other.recoveries;
    newObs.new_deaths = this.new_deaths + other.new_deaths;
    newObs.new_case = this.new_case + other.new_case;
    newObs.new_recoveries = this.new_recoveries + other.new_recoveries;

    newObs.date = this.date;
    newObs.days_since_first_case = this.days_since_first_case;
    newObs.isPrediction = false;

    if (this.isPrediction) {
      // console.log('self ', this, ' other ', other);
      if (
        this.confirmed_prediction === null ||
        other.confirmed_prediction === null
      ) {
        console.log('YELL HERE');
      }

      newObs.confirmed_prediction =
        this.confirmed_prediction + other.confirmed_prediction;

      newObs.confirmed_prediction_upper =
        this.confirmed_prediction_upper + other.confirmed_prediction_upper;

      newObs.confirmed_prediction_lower =
        this.confirmed_prediction_lower + other.confirmed_prediction_lower;

      newObs.daily_prediction = this.daily_prediction + other.daily_prediction;
      newObs.daily_prediction_upper =
        this.daily_prediction_upper + other.daily_prediction_upper;
      newObs.daily_prediction_lower =
        this.daily_prediction_lower + other.daily_prediction_lower;
      newObs.isPrediction = true;
    }
    return newObs;
  }
}

export type CountryTrendDict = { [country: string]: TrendDatum[] };
export type CountryStatsDict = { [country: string]: CountryStats[] };
export type RegionStatsDict = { [region: string]: RegionStats };

const datesAreOnSameDay = (first: Date, second: Date) => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};
