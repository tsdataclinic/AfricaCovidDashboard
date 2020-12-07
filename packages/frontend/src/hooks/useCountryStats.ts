import { useQuery } from 'react-query';

export interface CountryStats {
    name: string;
    population: number;
    continent: string;
    iso3: string;
    region: string;
    lnrchange: number;
    lncaseload_lastobs: number;
    lnexpo: number;
    lnsdi: number;
    lnurban: number;
    lnp70p: number;
    lnhhsn: number;
    lnihr2018: number;
    lnsqualty: number;
    lnhiv: number;
    lnasthma: number;
    lntraffic: number;
    nrows: number;
}

const getCountryStats = async (_: any, country: string | undefined) => {
    const request = await fetch(`/api/country/${country}/stats`);
    const result = await request.json();
    return result;
};

const getAllCouuntryStats = async (): Promise<{
    [key: string]: CountryStats;
}> => {
    const request = await fetch(`/api/country/stats`);
    const result = await request.json();
    return result;
};
export function useCountryStats(country: string | undefined) {
    return useQuery<CountryStats>(['countryStats', country], getCountryStats, {
        enabled: country,
    });
}
export function useAllCountryStats() {
    return useQuery<{ [key: string]: CountryStats }>(
        ['allcountrystats'],
        getAllCouuntryStats
    );
}
