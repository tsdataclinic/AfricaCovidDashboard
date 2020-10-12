import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryStats, TrendDatum, CountryTrendDict } from './country_types';
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
  })
  getAvailable(): string[] {
    return this.countryService.getAvailableCountries();
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
  @ApiOkResponse({
    description: 'Time series data array of trend data for a country',
    type: TrendDatum,
    isArray: true,
  })
  continentTrends(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.countryService.getContinentTrends();
  }

  @Get('/:country/trends')
  @ApiParam({
    name: 'country',
    description: 'The country you want trend data from',
    example: 'Egypt',
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
  @ApiOkResponse({
    description: 'Time series data array of trend data for a country',
    type: TrendDatum,
    isArray: true,
  })
  getTrendForCountry(
    @Param('country') country: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): TrendDatum[] {
    return this.countryService.getTrendForCountry(country, startDate, endDate);
  }

  @Get('/:country/stats')
  @ApiParam({
    name: 'country',
    description: 'The country to retrieve stats form',
    example: 'Spain',
  })
  @ApiOkResponse({
    description: 'JSON array of relevant stats for a country',
    type: CountryStats,
  })
  @ApiNotFoundResponse({
    description: "We don't have data for this country",
  })
  getStatsForCountry(@Param('country') country: string): CountryStats {
    return this.countryService.getStatsForCountry(country);
  }

  @Get('/trends')
  @ApiOkResponse({
    description: 'JSON dict of the trends for each country',
  })
  getAllTrends(): CountryTrendDict {
    return this.countryService.getAllTrends();
  }
}
