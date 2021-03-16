'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
exports.__esModule = true;
exports.ModelService = void 0;
var common_1 = require('@nestjs/common');
var country_types_1 = require('src/country/country_types');
var fs = require('fs');
var csv_reader_1 = require('csv-reader');
var countryISO_1 = require('src/utils/countryISO');
var ModelService = /** @class */ (function () {
  function ModelService() {
    var _this = this;
    this.loadPredictions().then(function (data) {
      _this.predictions = data;
      console.log('Setting predictions as ', Object.keys(data));
    });
  }
  ModelService.prototype.loadPredictions = function () {
    return new Promise(function (resolve, reject) {
      var data = {};
      var readStream = fs.createReadStream(
        'data/forecastestimates.csv',
        'utf8',
      );
      readStream
        .pipe(
          new csv_reader_1['default']({ parseNumbers: true, asObject: true }),
        )
        .on('data', function (row) {
          // Get the ISO details of the country so we can link things up
          // using the iso3 number
          var countryDetails = countryISO_1.getCountryISO(row['Country']);
          if (countryDetails && row['prediction'] !== 'NA') {
            var datum = new country_types_1.TrendDatum();
            datum.isPrediction = true;
            datum.date = row['Date'];
            datum.daily_prediction = row['Est'];
            datum.daily_prediction_upper = row['Upper'];
            datum.daily_prediction_lower = row['Lower'];
            data[countryDetails.iso3] = data[countryDetails.iso3]
              ? __spreadArrays(data[countryDetails.iso3], [datum])
              : [datum];
          } else {
            console.log('no prediction for ', row['Country_Region']);
          }
        })
        .on('end', function () {
          resolve(data);
        })
        .on('error', function (err) {
          reject(err);
        });
    });
  };
  ModelService.prototype.predictForCountry = function (countryISO) {
    return this.predictions[countryISO];
  };
  ModelService.prototype.allPredictions = function () {
    return this.predictions;
  };
  ModelService = __decorate([common_1.Injectable()], ModelService);
  return ModelService;
})();
exports.ModelService = ModelService;
