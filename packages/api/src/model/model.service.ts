import { Injectable } from '@nestjs/common';
import { publicDecrypt } from 'crypto';
import { CountryTrendDict, TrendDatum } from 'src/country/country_types';
import { ModelDatum } from './model.types';
import * as fs from 'fs';
import CsvReadableStream from 'csv-reader';
import { getCountryISO } from 'src/utils/countryISO';

@Injectable()
export class ModelService {
  predictions: CountryTrendDict | null;
  constructor() {
    this.loadPredictions().then((data: CountryTrendDict) => {
      this.predictions = data;
      console.log('Setting predictions as ', Object.keys(data));
    });
  }

  loadPredictions() {
    return new Promise((resolve, reject) => {
      let data: CountryTrendDict = {};
      const readStream = fs.createReadStream(
        'data/modelprojections.csv',
        'utf8',
      );
      readStream
        .pipe(new CsvReadableStream({ parseNumbers: true, asObject: true }))
        .on('data', row => {
          // Get the ISO details of the country so we can link things up
          // using the iso3 number
          const countryDetails = getCountryISO(row['Country_Region']);
          if (countryDetails && row['prediction'] !== 'NA') {
            const datum = new TrendDatum();
            datum.isPrediction = true;
            datum.date = row['Date'];
            datum.confirmed_prediction = row['prediction'];
            datum.exposure = row['exposure'];
            datum.confirmed_prediction_upper = row['upper'];
            datum.confirmed_prediction_lower = row['lower'];
            data[countryDetails.iso3] = data[countryDetails.iso3]
              ? [...data[countryDetails.iso3], datum]
              : [datum];
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

  predictForCountry(countryISO: string): TrendDatum[] {
    return this.predictions[countryISO];
  }
}
