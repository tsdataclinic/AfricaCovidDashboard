import fetch from 'node-fetch';
import CsvReadableStream from 'csv-reader';
import { Readable } from 'stream';
import { TrendDatum, CountryTrendDict } from '../country/country_types';
import { getCountryISO } from './countryISO';

async function getJHFTimeSeriesFile(
  type: 'deaths' | 'recovered' | 'confirmed',
) {
  const url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${type}_global.csv`;
  const query = await fetch(url);
  const csvString = await query.text();

  const stream = new Readable({ encoding: 'utf8' });
  stream.push(csvString);
  stream.push(null);
  let headers: null | any[] = null;
  let data = [];
  return new Promise((resolve, reject) => {
    stream
      .pipe(new CsvReadableStream({ parseNumbers: true, asObject: false }))
      .on('data', (row) => {
        if (!headers) {
          headers = row as [];
        } else {
          const prov = row[0];
          const country = row[1];
          (row as []).slice(4).forEach((val, index) => {
            data.push({
              date: headers[index + 4],
              value: val,
              country: country,
              prov: prov,
            });
          });
        }
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (err) => {
        console.log('something went wrong');
      });
  });
}

export async function getDataFromJHTS() {
  const deaths = await getJHFTimeSeriesFile('deaths');
  const confirmed = await getJHFTimeSeriesFile('confirmed');
  const recovered = await getJHFTimeSeriesFile('recovered');

  // We need to filter out entries that are for sub regions
  // here and just focus on country level stats
  const countries = Array.from(
    new Set(
      (deaths as any[])
        .filter((obs) => obs.prov === '')
        .map((obs) => obs.country),
    ),
  );

  const all_results: CountryTrendDict = {};

  countries.forEach((country) => {
    const countryDeaths = (deaths as any).filter(
      (obs) => obs.country === country,
    );
    const countryConfirmed = (confirmed as any).filter(
      (obs) => obs.country === country,
    );
    const countryRecovery = (recovered as any).filter(
      (obs) => obs.country === country,
    );

    //Format the daily numbers properly
    const countryResults = (countryDeaths as any[]).map((obs, index) => {
      let trendDatum = new TrendDatum();
      trendDatum.date = new Date(obs.date);
      trendDatum.deaths = obs.value;
      trendDatum.confirmed = countryConfirmed[index].value;
      trendDatum.recoveries = countryRecovery[index].value;
      trendDatum.isPrediction = false;
      return trendDatum;
    });

    //Sort the results by date
    const sortedCountryResults = countryResults.sort((a, b) =>
      a.date > b.date ? 1 : -1,
    );

    //Calculate diffs
    const resultsWithDiffs = sortedCountryResults.map((obs, index) => {
      if (index === 0) {
        obs.new_case = obs.confirmed;
        obs.new_deaths = obs.deaths;
        obs.new_recoveries = obs.recoveries;
      } else {
        const prev = sortedCountryResults[index - 1];
        obs.new_case = obs.confirmed - prev.confirmed;
        obs.new_deaths = obs.deaths - prev.deaths;
        obs.new_recoveries = obs.recoveries - prev.recoveries;
      }
    });

    const countryISO = getCountryISO(country);
    if (countryISO) {
      all_results[countryISO.iso3] = sortedCountryResults;
    } else {
      console.log(`miss for country {}`, country);
    }
  });

  return all_results;
}
