import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryStats, TrendDatum, CountryTrendDict } from './country_types';
import CsvReadableStream from 'csv-reader';
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
    this.loadTrends().then((data: CountryTrendDict) => {
      this.allCountryTrends = data;
    });
  }

  loadTrends() {
    let data: CountryTrendDict = {};
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(
        'data/modelprojections.csv',
        'utf8',
      );
      readStream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
        .on('data', row => {
          const country = row['Country_Region'];
          if (row['New Cases'] === 'NA') {
            return;
          }
          const datum: TrendDatum = {
            date: new Date(row['Date']),
            new_case: row['New Cases'],
            new_deaths: row['New Deaths'],
            new_recoveries: row['New Recoveries'],
            days_since_first_case: row['DaysSince'],
            confirmed: row['Confirmed'],
            deaths: row['Deaths'],
            recoveries: row['Recovered'],
          };

          if (data[country]) {
            data[country].push(datum);
          } else {
            data[country] = [datum];
          }
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

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

  getAvaliableCountries() {
    return this.allCountryStats ? Object.keys(this.allCountryTrends) : [];
  }

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

  getStatsForCountry(country: string): CountryStats {
    console.log('Getting stats for trend ', country);
    if (this.allCountryStats) {
      return this.allCountryStats.find(cs => cs.name === country);
    } else {
      throw new NotFoundException('Country not found');
    }
  }
}
