import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelDatum } from './model.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
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
  getModelIndex() {
    return this.modelService.predictions;
  }

  @UseInterceptors(FileInterceptor('ModelData/forecastestimates.csv'))
  @Post('/')
  updateModel(@UploadedFile() file: any) {
    console.log(`Updating predictions at ${new Date()}`);
    this.modelService.loadPredictionsFromString(file.buffer);
    return 'File uploaded';
  }

  // @Get('/:country')
  // @ApiParam({
  //   name: 'country',
  //   description: 'The country you want to get model data for',
  // })
  // @ApiOkResponse({
  //   description: 'A json array of model data',
  // })
  // @ApiNotFoundResponse({
  //   description: 'No country of that name found',
  // })
  // getModelForCountry(@Param() params): ModelDatum[] {
  //   return this.modelService.getModelForCountry(params.country);
  // }
}
