import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CountryStats,
  TrendDatum,
  CountryTrendDict,
  Country,
  CountryStatsDict,
  RegionStats,
  RegionStatsDict,
} from './country_types';
import CsvReadableStream from 'csv-reader';
import { getDataFromJHTS } from '../utils/JohnHopkins';

import * as fs from 'fs';
import { getCountryISO, getCountryDetailsForISO } from 'src/utils/countryISO';
import { ModelService } from '../model/model.service';
import { rollingDailyData } from 'src/utils/rollingUtils';

@Injectable()
export class CountryService {
  allCountryTrends: CountryTrendDict | null;
  allCountryStats: CountryStats[];
  countries: Country[];
  avaliableCountries: string[];
  lastUpdatedTime: Date;

  constructor(private readonly modelService: ModelService) {
    this.loadCountryStats().then((data: CountryStats[]) => {
      this.allCountryStats = data;
    });

    if (!this.allCountryStats) {
      getDataFromJHTS().then((data: CountryTrendDict) => {
        this.allCountryTrends = data;
        this.countries = Object.keys(this.allCountryTrends).map(
          getCountryDetailsForISO,
        );

        this.lastUpdatedTime = new Date();
      });
    }
  }

  //** Loads the stats from the model based stats file */
  async loadCountryModelStats(): Promise<CountryStats[]> {
    return new Promise((resolve, reject) => {
      let data: CountryStats[] = [];
      const readStream = fs.createReadStream('data/filtereddata.csv', 'utf8');
      readStream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
        .on('data', row => {
          // Get the ISO details of the country so we can link things up
          // using the iso3 number
          const countryDetails = getCountryISO(
            row['countryorarea'] === 'Congo'
              ? 'Republic of the Congo'
              : row['countryorarea'],
          );
          const datum = {
            name: row['countryorarea'],
            population: 10000,
            continent: countryDetails ? countryDetails.continent : '',
            iso3: countryDetails ? countryDetails.iso3 : '',
            ...row,
          };
          delete datum['countryorarea'];
          data.push(datum as any);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  //** Loads the stats from the population stats file */
  //** NOTE THE DATA ISN'T AVALIBLE FOR 2020, we should record when it last was recorded */
  async loadPopulationStats() {
    return new Promise((resolve, reject) => {
      let result = {};
      const readStream = fs.createReadStream(
        'data/API_SP.POP.TOTL_DS2_en_csv_v2_1593924.csv',
        'utf8',
      );
      let lineNo = 0;
      readStream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: false }))
        .on('data', (row, index) => {
          if (lineNo > 3) {
            let pops = row.slice(3, row.length - 1);
            pops.reverse();
            let pop = pops.find(f => f);
            row[row.length - 3];
            if (typeof pop == 'string') {
              pop = parseInt(pop);
            }
            result[row[1]] = pop;
          }
          lineNo += 1;
        })
        .on('end', () => {
          resolve(result);
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  //Load the stats about countries
  async loadCountryStats() {
    const modelStats = await this.loadCountryModelStats();
    const population = await this.loadPopulationStats();
    return modelStats.map(ms => ({
      ...ms,
      population: population[ms.iso3],
    }));
  }

  getLastUpdate() {
    return this.lastUpdatedTime;
  }

  //** Returns a list of countries for which we have data*/
  getAvailableCountries() {
    return this.countries
      ? this.countries.filter(c => c.continent === 'Africa')
      : [];
  }

  //** Get trend data for the specified country */
  getTrendForCountryISO(
    countryISO: string,
    startDate: Date,
    endDate: Date,
    rollingDays: number = 1,
    includePrediction: boolean = false,
  ): TrendDatum[] {
    if (
      this.allCountryTrends &&
      Object.keys(this.allCountryTrends).includes(countryISO)
    ) {
      return this.getTrendAndPrediction(countryISO, rollingDays);
    } else {
      throw new NotFoundException('Count not find country');
    }
  }

  getTrendAndPrediction(iso: string, rollingDays: number = 1) {
    const trend = rollingDailyData(this.allCountryTrends[iso], rollingDays);
    const prediction = this.modelService.predictForCountry(iso);
    const combined = [...trend, ...(prediction ? prediction : [])];
    return combined;
  }

  //** Returns a TrendDatum of data aggregated to the entire continent */
  getContinentTrends(rollingDays: number = 1): TrendDatum[] {
    let africaTrends = Object.values(this.getAllTrends(rollingDays));
    let names = Object.keys(this.getAllTrends(rollingDays));

    return africaTrends.reduce(
      (trend: TrendDatum[], countryTrend: TrendDatum[], index) =>
        trend.length == 0
          ? countryTrend
          : trend.map((t, i) => {
              const sum =
                countryTrend[i] && names[index] !== 'TZA'
                  ? t.add(countryTrend[i])
                  : t;
              return sum;
            }),
      [],
    );
  }

  //** Returns the trends for all countries */
  getAllTrends(rollingDays: number = 1): CountryTrendDict {
    let trendsPlusPredictions: CountryTrendDict = {};
    const predictions = this.modelService.allPredictions();
    const onlyAfrica = this.countries.filter(c => c.continent === 'Africa');

    onlyAfrica.forEach(country => {
      let iso3 = country.iso3;
      let trend = this.allCountryTrends[country.iso3];
      let last_value = trend[trend.length - 1];
      let last_cumulative_value = last_value.confirmed;
      let countryPrediction = predictions[iso3] ? [...predictions[iso3]] : [];
      if (countryPrediction[0]) {
        countryPrediction[0].daily_prediction =
          countryPrediction[0].confirmed_prediction - last_cumulative_value;
        countryPrediction[0].daily_prediction_upper =
          countryPrediction[0].confirmed_prediction_upper -
          last_cumulative_value;
        countryPrediction[0].daily_prediction_lower =
          countryPrediction[0].confirmed_prediction_lower -
          last_cumulative_value;
      }

      trendsPlusPredictions[iso3] = [
        ...rollingDailyData(this.allCountryTrends[iso3], rollingDays),
        ...countryPrediction,
      ];
    });

    return trendsPlusPredictions;
  }

  //** Returns stats for all countries */
  getAllStats(): CountryStatsDict {
    return this.allCountryStats.reduce(
      (acc, stat) => ((acc[stat.iso3] = stat), acc),
      {},
    );
  }

  //** Get region stats */
  getRegionStats(): RegionStatsDict {
    const regions = this.getRegions();
    let result: RegionStatsDict = {};
    regions.forEach(region => {
      const regionStats = this.countries
        .filter(c => c.region === region)
        .map(c => this.allCountryStats.find(s => s.iso3 == c.iso3))
        .filter(c => c && c.population);
      const population = regionStats.reduce(
        (acc, stats) => acc + stats.population,
        0,
      );
      result[region] = new RegionStats(region, population);
    });
    return result;
  }

  //** Returns a Country Stats for the requested country*/
  getStatsForCountryISO(countryISO: string): CountryStats {
    if (this.allCountryStats) {
      return this.allCountryStats.find(cs => cs.iso3 === countryISO);
    } else {
      throw new NotFoundException('Country not found');
    }
  }

  //** Returns the unique region list */
  getRegions(): string[] {
    return Array.from(
      new Set(
        this.countries.filter(c => c.continent === 'Africa').map(c => c.region),
      ),
    );
  }

  getRegionTrends(rollingDays: number = 1): CountryTrendDict {
    const regions = this.getRegions();
    let result: CountryTrendDict = {};
    regions.forEach(region => {
      const regionISOS = this.countries
        .filter(c => c.region === region)
        .map(c => c.iso3);
      const trends = regionISOS
        .filter(iso => iso !== 'TZA')
        .map(iso => this.getTrendAndPrediction(iso, rollingDays));
      let region_trend = trends.reduce(
        (trend: TrendDatum[], countryTrend: TrendDatum[], index) =>
          trend.length == 0
            ? countryTrend
            : trend.map((t, i) =>
                countryTrend[i] ? t.add(countryTrend[i]) : t,
              ),
        [],
      );

      result[region] = region_trend;
    });
    return result;
  }
}
