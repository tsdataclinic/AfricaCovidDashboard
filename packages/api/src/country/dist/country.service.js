'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.CountryService = void 0;
var common_1 = require('@nestjs/common');
var country_types_1 = require('./country_types');
var csv_reader_1 = require('csv-reader');
var JohnHopkins_1 = require('../utils/JohnHopkins');
var fs = require('fs');
var countryISO_1 = require('src/utils/countryISO');
var CountryService = /** @class */ (function () {
  function CountryService(modelService) {
    var _this = this;
    this.modelService = modelService;
    this.loadCountryStats().then(function (data) {
      _this.allCountryStats = data;
    });
    if (!this.allCountryStats) {
      JohnHopkins_1.getDataFromJHTS().then(function (data) {
        _this.allCountryTrends = data;
        _this.countries = Object.keys(_this.allCountryTrends).map(
          countryISO_1.getCountryDetailsForISO,
        );
      });
    }
  }
  //** Loads the stats from the model based stats file */
  CountryService.prototype.loadCountryModelStats = function () {
    return __awaiter(this, void 0, Promise, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var data = [];
            var readStream = fs.createReadStream(
              'data/filtereddata.csv',
              'utf8',
            );
            readStream
              .pipe(
                new csv_reader_1['default']({
                  parseNumbers: true,
                  asObject: true,
                }),
              )
              .on('data', function (row) {
                // Get the ISO details of the country so we can link things up
                // using the iso3 number
                var countryDetails = countryISO_1.getCountryISO(
                  row['countryorarea'],
                );
                var datum = __assign(
                  {
                    name: row['countryorarea'],
                    population: 10000,
                    continent: countryDetails ? countryDetails.continent : '',
                    iso3: countryDetails ? countryDetails.iso3 : '',
                  },
                  row,
                );
                delete datum['countryorarea'];
                data.push(datum);
              })
              .on('end', function () {
                resolve(data);
              })
              .on('error', function (err) {
                reject(err);
              });
          }),
        ];
      });
    });
  };
  //** Loads the stats from the population stats file */
  //** NOTE THE DATA ISN'T AVALIBLE FOR 2020, we should record when it last was recorded */
  CountryService.prototype.loadPopulationStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          new Promise(function (resolve, reject) {
            var result = {};
            var readStream = fs.createReadStream(
              'data/API_SP.POP.TOTL_DS2_en_csv_v2_1593924.csv',
              'utf8',
            );
            var lineNo = 0;
            readStream
              .pipe(
                new csv_reader_1['default']({
                  parseNumbers: true,
                  asObject: false,
                }),
              )
              .on('data', function (row, index) {
                if (lineNo > 3) {
                  var pop = row[row.length - 3];
                  if (typeof pop == 'string') {
                    pop = parseInt(pop);
                  }
                  result[row[1]] = pop;
                }
                lineNo += 1;
              })
              .on('end', function () {
                resolve(result);
              })
              .on('error', function (err) {
                reject(err);
              });
          }),
        ];
      });
    });
  };
  //Load the stats about countries
  CountryService.prototype.loadCountryStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var modelStats, population;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.loadCountryModelStats()];
          case 1:
            modelStats = _a.sent();
            return [4 /*yield*/, this.loadPopulationStats()];
          case 2:
            population = _a.sent();
            return [
              2 /*return*/,
              modelStats.map(function (ms) {
                return __assign(__assign({}, ms), {
                  population: population[ms.iso3],
                });
              }),
            ];
        }
      });
    });
  };
  //** Returns a list of countries for which we have data*/
  CountryService.prototype.getAvailableCountries = function () {
    return this.countries
      ? this.countries.filter(function (c) {
          return c.continent === 'Africa';
        })
      : [];
  };
  //** Get trend data for the specified country */
  CountryService.prototype.getTrendForCountryISO = function (
    countryISO,
    startDate,
    endDate,
    includePrediction,
  ) {
    if (includePrediction === void 0) {
      includePrediction = false;
    }
    if (
      this.allCountryTrends &&
      Object.keys(this.allCountryTrends).includes(countryISO)
    ) {
      var trend = this.allCountryTrends[countryISO];
      var prediction = this.modelService.predictForCountry(countryISO);
      return __spreadArrays(trend, prediction);
    } else {
      throw new common_1.NotFoundException('Count not find country');
    }
  };
  //** Returns a TrendDatum of data aggregated to the entire continent */
  CountryService.prototype.getContinentTrends = function () {
    var _this = this;
    var africaISOS = this.countries
      .filter(function (c) {
        return c.continent === 'Africa';
      })
      .map(function (c) {
        return c.iso3;
      });
    var africaTrends = africaISOS.map(function (iso) {
      return _this.allCountryTrends[iso];
    });
    return africaTrends.reduce(function (trend, countryTrend) {
      return trend.length == 0
        ? countryTrend
        : trend.map(function (t, i) {
            return t.add(countryTrend[i]);
          });
    }, []);
  };
  //** Returns the trends for all countries */
  CountryService.prototype.getAllTrends = function () {
    var _this = this;
    var trendsPlusPredictions = {};
    var predictions = this.modelService.allPredictions();
    var onlyAfrica = this.countries.filter(function (c) {
      return c.continent === 'Africa';
    });
    onlyAfrica.forEach(function (country) {
      var iso3 = country.iso3;
      var trend = _this.allCountryTrends[country.iso3];
      var last_value = trend[trend.length - 1];
      var last_cumulative_value = last_value.confirmed;
      var countryPrediction = predictions[iso3]
        ? __spreadArrays(predictions[iso3])
        : [];
      //Update the cumulative predictions
      for (var i = 0; i < countryPrediction.length; i++) {
        var prediction = countryPrediction[i];
        var upper = last_cumulative_value + prediction.daily_prediction_upper;
        var lower = last_cumulative_value + prediction.daily_prediction_lower;
        last_cumulative_value += prediction.daily_prediction;
        countryPrediction[i].confirmed_prediction = last_cumulative_value;
        countryPrediction[i].confirmed_prediction_lower = lower;
        countryPrediction[i].confirmed_prediction_upper = upper;
      }
      trendsPlusPredictions[iso3] = __spreadArrays(
        _this.allCountryTrends[iso3],
        countryPrediction,
      );
    });
    return trendsPlusPredictions;
  };
  //** Returns stats for all countries */
  CountryService.prototype.getAllStats = function () {
    return this.allCountryStats.reduce(function (acc, stat) {
      return (acc[stat.iso3] = stat), acc;
    }, {});
  };
  //** Get region stats */
  CountryService.prototype.getRegionStats = function () {
    var _this = this;
    var regions = this.getRegions();
    var result = {};
    regions.forEach(function (region) {
      var regionStats = _this.countries
        .filter(function (c) {
          return c.region === region;
        })
        .map(function (c) {
          return _this.allCountryStats.find(function (s) {
            return s.iso3 == c.iso3;
          });
        })
        .filter(function (c) {
          return c && c.population;
        });
      var population = regionStats.reduce(function (acc, stats) {
        return acc + stats.population;
      }, 0);
      result[region] = new country_types_1.RegionStats(region, population);
    });
    return result;
  };
  //** Returns a Country Stats for the requested country*/
  CountryService.prototype.getStatsForCountryISO = function (countryISO) {
    if (this.allCountryStats) {
      return this.allCountryStats.find(function (cs) {
        return cs.iso3 === countryISO;
      });
    } else {
      throw new common_1.NotFoundException('Country not found');
    }
  };
  //** Returns the unique region list */
  CountryService.prototype.getRegions = function () {
    return Array.from(
      new Set(
        this.countries
          .filter(function (c) {
            return c.continent === 'Africa';
          })
          .map(function (c) {
            return c.region;
          }),
      ),
    );
  };
  CountryService.prototype.getRegionTrends = function () {
    var _this = this;
    var regions = this.getRegions();
    var result = {};
    regions.forEach(function (region) {
      var regionISOS = _this.countries
        .filter(function (c) {
          return c.region === region;
        })
        .map(function (c) {
          return c.iso3;
        });
      var trends = regionISOS.map(function (iso) {
        return _this.allCountryTrends[iso];
      });
      var region_trend = trends.reduce(function (trend, countryTrend) {
        return trend.length == 0
          ? countryTrend
          : trend.map(function (t, i) {
              return t.add(countryTrend[i]);
            });
      }, []);
      result[region] = region_trend;
    });
    return result;
  };
  CountryService = __decorate([common_1.Injectable()], CountryService);
  return CountryService;
})();
exports.CountryService = CountryService;
