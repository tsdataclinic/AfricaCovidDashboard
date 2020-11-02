import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CountryStats,
  TrendDatum,
  CountryTrendDict,
  Country,
} from './country_types';
import CsvReadableStream from 'csv-reader';
import { getDataFromJHTS } from '../utils/JohnHopkins';

import * as fs from 'fs';
import { getCountryISO, getCountryDetailsForISO } from 'src/utils/countryISO';

@Injectable()
export class CountryService {
  allCountryTrends: CountryTrendDict | null;
  allCountryStats: CountryStats[];
  countries: Country[];
  avaliableCountries: string[];

  constructor() {
    this.loadCountryStats().then((data: CountryStats[]) => {
      this.allCountryStats = data;
    });

    if (!this.allCountryStats) {
      getDataFromJHTS().then((data: CountryTrendDict) => {
        this.allCountryTrends = data;
        this.countries = Object.keys(this.allCountryTrends).map(
          getCountryDetailsForISO,
        );
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
          const countryDetails = getCountryISO(row['countryorarea']);
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
          if (lineNo > 3) result[row[1]] = row[row.length - 3];
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

  //** Returns a list of countries for which we have data*/
  getAvailableCountries() {
    return this.countries ? this.countries : [];
  }

  //** Get trend data for the specified country */
  getTrendForCountryISO(
    countryISO: string,
    startDate: Date,
    endDate: Date,
  ): TrendDatum[] {
    if (
      this.allCountryTrends &&
      Object.keys(this.allCountryTrends).includes(countryISO)
    ) {
      return this.allCountryTrends[countryISO];
    } else {
      throw new NotFoundException('Count not find country');
    }
  }

  //** Returns a TrendDatum of data aggregated to the entire continent */
  getContinentTrends(): TrendDatum[] {
    const africaISOS = this.countries
      .filter(c => c.continent === 'Africa')
      .map(c => c.iso3);
    const africaTrends = africaISOS.map(iso => this.allCountryTrends[iso]);
    return africaTrends.reduce(
      (trend: TrendDatum[], countryTrend: TrendDatum[]) =>
        trend.length == 0
          ? countryTrend
          : trend.map((t, i) => t.add(countryTrend[i])),
      [],
    );
  }

  //** Returns the trends for all countries */
  getAllTrends(): CountryTrendDict {
    return this.allCountryTrends;
  }

  //** Returns a Country Stats for the requested country*/
  getStatsForCountryISO(countryISO: string): CountryStats {
    if (this.allCountryStats) {
      return this.allCountryStats.find(cs => cs.iso3 === countryISO);
    } else {
      throw new NotFoundException('Country not found');
    }
  }
}
