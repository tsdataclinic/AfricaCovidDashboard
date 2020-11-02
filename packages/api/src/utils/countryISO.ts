import CountryLookup from 'country-code-lookup';
import { Country } from 'src/country/country_types';

const overrides = {
  'Holy See': 'Holy See (Vatican City)',
  'Korea, South': 'South Korea',
  'Taiwan*': 'Taiwan',
  US: 'United States',
  Bahamas: 'The Bahamas',
  'Bolivia (Plurinational State of)': 'Bolivia',
  'Brunei Darussalam': 'Brunei',
  'Cabo Verde': 'Cape Verde',
  Congo: 'Democratic Republic of the Congo',
  "Côte d'Ivoire": "Cote d'Ivoire",
  Czechia: 'Czech Republic',
  "Dem. People's Rep. of Korea": 'North Korea',
  'Dem. Republic of the Congo': 'Democratic Republic of the Congo',
  Gambia: 'The Gambia',
  'Iran (Islamic Republic of)': 'Iran',
  "Lao People's Dem. Republic": 'Laos',
  'Marshall Islands (the)': 'Marshall Islands',
  'Micronesia (Federated States of)': 'Federated States of Micronesia',
  Myanmar: 'Myanmar (Burma)',
  'Republic of Korea': 'South Korea',
  'Republic of Moldova': 'Moldova',
  'Republic of North Macedonia': 'North Macedonia',
  'Russian Federation': 'Russia',
  Samoa: 'Western Samoa',
  'State of Palestine': 'Palestinian Territory',
  Swaziland: 'Eswatini',
  'Syrian Arab Republic': 'Syria',
  'United Arab Emirates (the)': 'United Arab Emirates',
  'United Republic of Tanzania': 'Tanzania',
  'United States of America': 'United States',
  'Venezuela (Bolivarian Republic of)': 'Venezuela',
  'Viet Nam': 'Vietnam',
  'Virgin Islands (U.S.)': 'Virgin Islands',
};

export function getCountryISO(country: string) {
  const countryName = Object.keys(overrides).includes(country)
    ? overrides[country]
    : country;
  return CountryLookup.byCountry(countryName);
}

export function getCountryDetailsForISO(iso: string) {
  const { country, continent, iso3, region } = CountryLookup.byIso(iso);
  return { name: country, continent, iso3, region };
}
