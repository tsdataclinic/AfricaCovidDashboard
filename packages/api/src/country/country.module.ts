import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { ModelModule } from '../model/model.module';

@Module({
  imports: [ModelModule],
  providers: [CountryService],
  controllers: [CountryController],
})
export class CountryModule {}
