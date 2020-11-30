import { Injectable } from '@nestjs/common';
import { TrendDatum } from 'src/country/country_types';
import { ModelDatum } from './model.types';

@Injectable()
export class ModelService {
  getModelForCountry(country: string): ModelDatum[] {
    return [...Array(20)].map(a => ({
      x: Math.random() * 10,
      y: Math.random() * 20,
      y_lower: (Math.random() - 1) * 2,
      y_upper: Math.random() * 2,
    }));
  }

  predictForCountry(countryISO: string, trend: TrendDatum[], noDays = 30) {
    const dates = trend.map(t => t.date);
    const confirmed = trend.map(t => t.confirmed);
    const lastDate = dates[dates.length - 1];
    const lastConfirmed = confirmed[confirmed.length - 1];
    const prediction: TrendDatum[] = [];
    for (let i = 0; i < noDays; i++) {
      const date = new Date();
      date.setDate(lastDate.getDate() + i);
      const td = new TrendDatum();
      td.confirmed_prediction = i * 10 + lastConfirmed;
      td.confirmed_prediction_upper =
        td.confirmed_prediction + 22 + Math.random() * 5;
      td.confirmed_prediction_lower =
        td.confirmed_prediction - 23 - Math.random() * 10;
      td.isPrediction = true;
      td.date = date;
      prediction.push(td);
    }

    return prediction;
  }
}
