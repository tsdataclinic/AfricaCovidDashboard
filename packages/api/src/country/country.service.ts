import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryStats, TrendDatum, CountryTrendDict } from './country_types';
import CsvReadableStream from 'csv-reader';
import { getDataFromJHTS } from '../utils/JohnHopkins';

import * as fs from 'fs';

@Injectable()
export class CountryService {
  allCountryTrends: CountryTrendDict;
  allCountryStats: CountryStats[];

  avaliableCountries: string[];

  constructor() {
    this.loadCountryStats().then((data: CountryStats[]) => {
      this.allCountryStats = data;
    });

    getDataFromJHTS().then((data: CountryTrendDict) => {
      this.allCountryTrends = data;
    });
  }

  //** Loads the stats from the data file, need to hook this up live datasources*/
  loadCountryStats() {
    let data: CountryStats[] = [];
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream('data/filtereddata.csv', 'utf8');
      readStream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
        .on('data', row => {
          const datum = {
            name: row['countryorarea'],
            population: 10000,
            ...row,
          };
          delete datum['countryorarea'];
          data.push(datum as any);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', err => {
          console.log('something went wrong');
          reject(err);
        });
    });
  }

  //** Returns a list of countries for which we have data*/
  getAvailableCountries() {
    return this.allCountryStats ? Object.keys(this.allCountryTrends) : [];
  }

  //** Get trend data for the specified country */
  getTrendForCountry(
    country: string,
    startDate: Date,
    endDate: Date,
  ): TrendDatum[] {
    if (
      this.allCountryTrends &&
      Object.keys(this.allCountryTrends).includes(country)
    ) {
      return this.allCountryTrends[country];
    } else {
      throw new NotFoundException('Count not find country');
    }
  }

  //** Returns a TrendDatum of data aggregated to the entire continent */
  getContinentTrends(): TrendDatum[] {
    return Object.values(this.allCountryTrends).reduce(
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
  getStatsForCountry(country: string): CountryStats {
    console.log('Getting stats for trend ', country);
    if (this.allCountryStats) {
      return this.allCountryStats.find(cs => cs.name === country);
    } else {
      throw new NotFoundException('Country not found');
    }
  }
}
