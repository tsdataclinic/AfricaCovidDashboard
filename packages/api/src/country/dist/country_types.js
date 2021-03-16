'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
exports.__esModule = true;
exports.TrendDatum = exports.CountryStats = exports.RegionStats = exports.Country = void 0;
var swagger_1 = require('@nestjs/swagger');
var Country = /** @class */ (function () {
  function Country() {}
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The name of the country',
        examples: ['Spain', 'France', 'Egypt'],
        example: 'Egypt',
      }),
    ],
    Country.prototype,
    'name',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Region in which the country resides',
      }),
    ],
    Country.prototype,
    'region',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The continent where the country is located',
      }),
    ],
    Country.prototype,
    'continent',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The Iso3 string for the country',
      }),
    ],
    Country.prototype,
    'iso3',
  );
  return Country;
})();
exports.Country = Country;
var RegionStats = /** @class */ (function () {
  function RegionStats(name, population) {
    this.name = name;
    this.population = population;
  }
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Stats for each region',
        examples: ['CentralAfrica'],
        example: 'CentralAfrica',
      }),
    ],
    RegionStats.prototype,
    'name',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Population of the region',
        examples: [10000, 20000],
        example: 1000,
      }),
    ],
    RegionStats.prototype,
    'population',
  );
  return RegionStats;
})();
exports.RegionStats = RegionStats;
var CountryStats = /** @class */ (function () {
  function CountryStats() {}
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The name of the country',
        examples: ['Spain', 'France', 'Egypt'],
        example: 'Egypt',
      }),
    ],
    CountryStats.prototype,
    'name',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Region in which the country resides',
      }),
    ],
    CountryStats.prototype,
    'region',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The continent where the country is located',
      }),
    ],
    CountryStats.prototype,
    'continent',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'The Iso3 string for the country',
      }),
    ],
    CountryStats.prototype,
    'iso3',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Population of the country',
        examples: [10000, 20000, 30000],
        example: 10000,
      }),
    ],
    CountryStats.prototype,
    'population',
  );
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnrchange');
  __decorate(
    [swagger_1.ApiProperty()],
    CountryStats.prototype,
    'lncaseload_lastobs',
  );
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnexpo');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnsdi');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnurban');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnp70p');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnhhsn');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnihr2018');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnsqualty');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnhiv');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lnasthma');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'lntraffic');
  __decorate([swagger_1.ApiProperty()], CountryStats.prototype, 'nrows');
  return CountryStats;
})();
exports.CountryStats = CountryStats;
var TrendDatum = /** @class */ (function () {
  function TrendDatum() {}
  TrendDatum.prototype.add = function (other) {
    if (!datesAreOnSameDay(this.date, other.date)) {
      throw new Error(
        "Trend Datum don't match " + this.date + ', ' + other.date,
      );
    }
    var newObs = new TrendDatum();
    newObs.deaths = this.deaths + other.deaths;
    newObs.confirmed = this.confirmed + other.confirmed;
    newObs.recoveries = this.recoveries + other.recoveries;
    newObs.new_deaths = this.new_deaths + other.new_deaths;
    newObs.new_case = this.new_case + other.new_case;
    newObs.new_recoveries = this.new_recoveries + other.new_recoveries;
    newObs.date = this.date;
    newObs.days_since_first_case = this.days_since_first_case;
    if (this.isPrediction) {
      newObs.confirmed_prediction =
        this.confirmed_prediction + other.confirmed_prediction;
      // TODO: update prediction
      newObs.confirmed_prediction_upper =
        this.confirmed_prediction_upper + other.confirmed_prediction_upper;
      newObs.confirmed_prediction_lower =
        this.confirmed_prediction_lower + other.confirmed_prediction_lower;
      newObs.daily_prediction += this.daily_prediction + other.daily_prediction;
      newObs.isPrediction = true;
    }
    return newObs;
  };
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Date of the observation',
      }),
    ],
    TrendDatum.prototype,
    'date',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Cumulative number of deaths up to this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'deaths',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Cumulative number of confirmed up to this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'confirmed',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Cumulative number of recoveries up to this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'recoveries',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'New number of new deaths this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'new_deaths',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'New number of new cases this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'new_case',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'New number of new recoveries this day',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'new_recoveries',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Days since first case',
        minimum: 0,
      }),
    ],
    TrendDatum.prototype,
    'days_since_first_case',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'is this data point a prediction or an observation',
      }),
    ],
    TrendDatum.prototype,
    'isPrediction',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Model exposure',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'exposure',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Cumulative cases prediction',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'confirmed_prediction',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Upper limit of cumulative cases prediction ',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'confirmed_prediction_upper',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Upper limit of cumulative cases prediction ',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'confirmed_prediction_lower',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Lower limit of predicted daily cases',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'daily_prediction_lower',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Upper limit of predicted daily cases ',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'daily_prediction_upper',
  );
  __decorate(
    [
      swagger_1.ApiProperty({
        description: 'Daily predicted cases',
        nullable: true,
      }),
    ],
    TrendDatum.prototype,
    'daily_prediction',
  );
  return TrendDatum;
})();
exports.TrendDatum = TrendDatum;
var datesAreOnSameDay = function (first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};
