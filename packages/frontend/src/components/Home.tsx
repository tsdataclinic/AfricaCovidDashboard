import React, { useCallback, useContext, useMemo } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Alert, Col, Row } from 'antd';
import {
    CountryTrend,
    useAfricaTrends,
    useAllCountryTrends,
} from '../hooks/useCountryTrends';
import { useAllRegionTrends } from '../hooks/useRegionTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import moment, { Moment } from 'moment';
import DateSlider from './DateSlider';
import { convertDateStrToDate } from '../helper';
import QueryParamsContext from '../contexts/QueryParamsContext';
import styled from 'styled-components';
import { mapValues, pickBy, Dictionary, isNil, negate } from 'lodash';
import QueryControl from './QueryControl';

const Home = () => {
    const {
        country,
        region,
        isRegion,
        dataType,
        category,
        updateQuery,
        selectedDate,
    } = useContext(QueryParamsContext);

    const {
        data: allCountryTrends,
        error: allTrendsError,
        isLoading: allTrendsLoading,
    } = useAllCountryTrends();

    const {
        data: allRegionTrends,
        error: allRegionTrendsError,
        isLoading: allRegionLoading,
    } = useAllRegionTrends();

    const {
        data: africaTrends,
        error: africaTrendsError,
        isLoading: africaTrendsLoading,
    } = useAfricaTrends();

    const currentCountryTrends = useMemo(() => {
        if ((isRegion && !region) || (!isRegion && !country)) {
            // If no country or region is selected lets show all the stats
            return africaTrends || [];
        }

        // Region data
        if (isRegion) {
            if (
                allRegionTrendsError ||
                !allRegionTrends ||
                !(region in allRegionTrends)
            ) {
                return [];
            }

            return allRegionTrends[region];
        }

        // Country data
        if (
            allTrendsError ||
            !allCountryTrends ||
            !(country in allCountryTrends)
        ) {
            return [];
        }
        return allCountryTrends[country];
    }, [
        allCountryTrends,
        allTrendsError,
        country,
        region,
        allRegionTrends,
        isRegion,
    ]);

    const dates = useMemo(() => {
        return currentCountryTrends.map((item) =>
            convertDateStrToDate(item.date)
        );
    }, [currentCountryTrends]);

    const onSelectDate = useCallback(
        (value: Moment) => {
            updateQuery('selectedDate', value);
        },
        [updateQuery]
    );

    const trendsByDateByCountry = useMemo(() => {
        if (!allCountryTrends) {
            return undefined;
        }
        return mapValues(allCountryTrends, (trends) =>
            trends.reduce(
                (a: { [k in string]: CountryTrend }, b: CountryTrend) => {
                    a[moment(b.date).format('YYYY-MM-DD')] = b;
                    return a;
                },
                {}
            )
        );
    }, [allCountryTrends]);

    const selectedStatsByCountry:
        | Dictionary<CountryTrend>
        | undefined = useMemo(() => {
        if (!trendsByDateByCountry) {
            return undefined;
        }
        const withSelectedDate = mapValues(
            trendsByDateByCountry,
            (trendsByDate) =>
                trendsByDate[(selectedDate || moment()).format('YYYY-MM-DD')]
        );
        // Filter out entries with empty values
        return pickBy(withSelectedDate, negate(isNil));
    }, [trendsByDateByCountry, selectedDate]);

    const selectedStats = useMemo(
        () =>
            currentCountryTrends.find((item) =>
                selectedDate?.isSame(item.date, 'day')
            ),
        [selectedDate, currentCountryTrends]
    );

    const isLoading =
        allTrendsLoading || africaTrendsLoading || allRegionLoading;
    const error = country
        ? allTrendsError
        : region
        ? allRegionTrendsError
        : africaTrendsError;

    if (error) {
        return (
            <StyledAlert
                message="Error retrieving data. Please reload to try again."
                type="error"
            />
        );
    }

    return (
        <div>
            <DateSlider
                dates={dates}
                onUpdate={onSelectDate}
                selectedDate={selectedDate}
            />
            <QueryControl
                region={region}
                country={country}
                dataType={dataType}
                isRegion={isRegion}
                updateQuery={updateQuery}
            />
            <Row gutter={[16, 16]}>
                <Col xs={24} md={24} lg={12}>
                    <StatsBar
                        dataType={dataType}
                        category={category}
                        selectCategory={(category) =>
                            updateQuery('category', category)
                        }
                        loading={isLoading}
                        data={selectedStats}
                    />
                    <AfricaMap
                        selectedCountry={country}
                        onCountrySelect={(country) =>
                            updateQuery('country', country)
                        }
                        onRegionSelect={(region) =>
                            updateQuery('region', region)
                        }
                        category={category}
                        dataType={dataType}
                        trendData={selectedStatsByCountry}
                        loading={isLoading}
                        isRegion={isRegion}
                        selectedRegion={region}
                    />
                </Col>
                <Col xs={24} md={24} lg={12}>
                    <Trend
                        trendData={currentCountryTrends}
                        allDates={dates}
                        selectedDate={selectedDate}
                        dataType={dataType}
                        country={country}
                    />
                </Col>
            </Row>
        </div>
    );
};

const StyledAlert = styled(Alert)`
    margin: 0 20px;
`;

export default Home;
