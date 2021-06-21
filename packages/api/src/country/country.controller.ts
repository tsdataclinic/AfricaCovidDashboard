import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountryService } from './country.service';
import {
  CountryStats,
  TrendDatum,
  CountryTrendDict,
  Country,
  CountryStatsDict,
} from './country_types';
import {
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}
  @Get('/')
  @ApiOkResponse({
    description: 'JSON array of available countries',
    type: Country,
  })
  getAvailable(): Country[] {
    return this.countryService.getAvailableCountries();
  }

  @Get('/region')
  @ApiOkResponse({
    description: 'Available regions',
    type: String,
    isArray: true,
  })
  regions() {
    return this.countryService.getRegions();
  }

  @Get('/region/trends')
  @ApiQuery({
    name: 'rolling',
    description: 'Rolling days for daily data',
    example: 7,
  })
  @ApiOkResponse({
    description: 'Trends for all regions',
  })
  regionTrends(@Query('rolling') rollingDays?: number) {
    return this.countryService.getRegionTrends(rollingDays);
  }

  @Get('/region/stats')
  @ApiOkResponse({
    description: 'Stats for all regions',
  })
  regionStats() {
    return this.countryService.getRegionStats();
  }

  @Get('/africa/trends')
  @ApiQuery({
    name: 'startDate',
    description: 'The date to start retrieving the data for',
    type: Date,
    example: '2020-10-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'The date to stop retrieving the data for',
    type: Date,
    example: '2020-10-04',
    required: false,
  })
  @ApiQuery({
    name: 'rolling',
    description: 'Rolling days for daily data',
    example: 7,
  })
  @ApiOkResponse({
    description: 'Time series data array of trend data for a country',
    type: TrendDatum,
    isArray: true,
  })
  continentTrends(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('rolling') rollingDays?: number,
  ) {
    return this.countryService.getContinentTrends(rollingDays);
  }

  @Get('/:countryISO/trends')
  @ApiParam({
    name: 'countryISO',
    description: 'The country iso3 you want trend data from',
    example: 'UGA',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'The date to start retrieving the data for',
    type: Date,
    example: '2020-10-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'The date to stop retrieving the data for',
    type: Date,
    example: '2020-10-04',
    required: false,
  })
  @ApiQuery({
    name: 'rolling',
    description: 'Rolling days for daily data',
    example: 7,
  })
  @ApiOkResponse({
    description: 'Time series data array of trend data for a country',
    type: TrendDatum,
    isArray: true,
  })
  getTrendForCountry(
    @Param('countryISO') countryISO: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('rolling') rollingDays?: number,
  ): TrendDatum[] {
    return this.countryService.getTrendForCountryISO(
      countryISO,
      startDate,
      endDate,
      rollingDays,
    );
  }

  @Get('/:countryISO/stats')
  @ApiParam({
    name: 'country',
    description: 'The country iso3 to retrieve stats form',
    example: 'USA',
  })
  @ApiOkResponse({
    description: 'JSON array of relevant stats for a country',
    type: CountryStats,
  })
  @ApiNotFoundResponse({
    description: "We don't have data for this country",
  })
  getStatsForCountry(@Param('countryISO') countryISO: string): CountryStats {
    return this.countryService.getStatsForCountryISO(countryISO);
  }

  @Get('/updated')
  @ApiOkResponse({
    description: 'Returns the time the data was last updated',
    type: Date,
  })
  getLastUpdated(): Date {
    return this.countryService.getLastUpdate();
  }

  @Get('/stats')
  @ApiOkResponse({
    description: 'JSON array of relevant stats for a country',
    type: CountryStats,
  })
  @ApiNotFoundResponse({
    description: "We don't have data for this country",
  })
  getAllStats(): CountryStatsDict {
    return this.countryService.getAllStats();
  }
  @Get('/trends')
  @ApiQuery({
    name: 'rolling',
    description: 'Rolling days for daily data',
    example: 7,
  })
  @ApiOkResponse({
    description: 'JSON dict of the trends for each country',
  })
  getAllTrends(@Query('rolling') rollingDays?: number): CountryTrendDict {
    return this.countryService.getAllTrends(rollingDays);
  }
}
