import { Injectable } from '@nestjs/common';
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
}
