import { Injectable } from '@nestjs/common';
import { publicDecrypt } from 'crypto';
import { CountryTrendDict, TrendDatum } from 'src/country/country_types';
import { ModelDatum } from './model.types';
import * as fs from 'fs';
import CsvReadableStream from 'csv-reader';
import { Readable } from 'stream';
import { getCountryISO } from 'src/utils/countryISO';
import { resolve } from 'dns';

@Injectable()
export class ModelService {
  predictions: CountryTrendDict;
  constructor() {
    this.predictions = {};
  }

  normalizePredictions(data: CountryTrendDict) {
    Object.keys(data).forEach((country) => {
      data[country].forEach((datum: TrendDatum, index) => {
        if (index > 0) {
          data[country][index].daily_prediction =
            data[country][index].confirmed_prediction -
            data[country][index - 1].confirmed_prediction;
          data[country][index].daily_prediction_upper =
            data[country][index].confirmed_prediction_upper -
            data[country][index - 1].confirmed_prediction_upper;
          data[country][index].daily_prediction_lower =
            data[country][index].confirmed_prediction_lower -
            data[country][index - 1].confirmed_prediction_lower;
        }
      });
    });
  }

  parsePredictions(
    stream: fs.ReadStream | Readable,
  ): Promise<CountryTrendDict> {
    return new Promise((resolve, reject) => {
      let data: CountryTrendDict = {};
      stream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
        .on('data', (row) => {
          // Get the ISO details of the country so we can link things up
          // using the iso3 number
          const countryDetails = getCountryISO(row['Country']);
          if (countryDetails && row['prediction'] !== 'NA') {
            const datum = new TrendDatum();
            datum.isPrediction = true;
            datum.date = new Date(row['Date']);
            datum.confirmed_prediction = Math.exp(row['Est']);
            datum.confirmed_prediction_upper = Math.exp(row['Upper']);
            datum.confirmed_prediction_lower = Math.exp(row['Lower']);
            data[countryDetails.iso3] = data[countryDetails.iso3]
              ? [...data[countryDetails.iso3], datum]
              : [datum];
          } else {
            console.log('no prediction for ', row['Country_Region']);
          }
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  loadPredictionsFromString(csv: string | Buffer) {
    const readStream = Readable.from(csv, { encoding: 'utf8' });
    this.parsePredictions(readStream).then((data) => {
      this.normalizePredictions(data);
      this.predictions = data;
    });
  }

  loadPredictionsFromFile(file: any) {
    const readStream = fs.createReadStream(file, 'utf8');
    this.parsePredictions(readStream).then((data) => {
      this.normalizePredictions(data);
      this.predictions = data;
    });
  }

  predictForCountry(countryISO: string): TrendDatum[] {
    return this.predictions[countryISO];
  }

  allPredictions() {
    return this.predictions;
  }
}
