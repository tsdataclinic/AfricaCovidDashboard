import { Controller, Get, Param } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelDatum } from './model.types';
import {
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiProperty,
} from '@nestjs/swagger';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('/')
  getModelIndex(): string {
    return 'models are wrong';
  }

  @Get('/:country')
  @ApiParam({
    name: 'country',
    description: 'The country you want to get model data for',
  })
  @ApiOkResponse({
    description: 'A json array of model data',
  })
  @ApiNotFoundResponse({
    description: 'No country of that name found',
  })
  getModelForCountry(@Param() params): ModelDatum[] {
    return this.modelService.getModelForCountry(params.country);
  }
}