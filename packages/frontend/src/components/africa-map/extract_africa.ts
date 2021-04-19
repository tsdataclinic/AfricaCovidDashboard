import fs from 'fs';

let countries = JSON.parse(fs.readFileSync('countries.geojson', 'utf8'));

let features = countries.features.filter((f: any) => f.CONTINENT === 'Africa');

countries.features = features;

fs.writeFileSync('africa.geojson', JSON.stringify(countries), 'utf8');
