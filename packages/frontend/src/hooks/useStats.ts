import { useQuery } from 'react-query';

export interface Stats {
    name: string;
    population: number;
    continent?: string;
    iso3?: string;
    region?: string;
    lnrchange?: number;
    lncaseload_lastobs?: number;
    lnexpo?: number;
    lnsdi?: number;
    lnurban?: number;
    lnp70p?: number;
    lnhhsn?: number;
    lnihr2018?: number;
    lnsqualty?: number;
    lnhiv?: number;
    lnasthma?: number;
    lntraffic?: number;
    nrows?: number;
}

const getCountryStats = async (_: any, country: string | undefined) => {
    const request = await fetch(`/api/country/${country}/stats`);
    const result = await request.json();
    return result;
};

const getAllCountryStats = async (): Promise<{
    [key: string]: Stats;
}> => {
    const request = await fetch(`/api/country/stats`);
    const result = await request.json();
    return result;
};
export function useCountryStats(country: string | undefined) {
    return useQuery<Stats>(['countryStats', country], getCountryStats, {
        enabled: country,
    });
}
export function useAllCountryStats() {
    return useQuery<{ [key: string]: Stats }>(
        ['allcountrystats'],
        getAllCountryStats
    );
}

const getAllRegionStats = async (): Promise<{
    [key: string]: Stats;
}> => {
    const request = await fetch(`/api/country/region/stats`);
    const result = await request.json();
    return result;
};

export function useAllRegionStats() {
    return useQuery<{ [key: string]: Stats }>(
        ['allregionstats'],
        getAllRegionStats
    );
}
