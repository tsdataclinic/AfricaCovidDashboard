import React, { useCallback, useContext, useMemo } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Alert, Col, Row } from 'antd';
import {
    CountryTrend,
    useAfricaTrends,
    useAllCountryTrends,
} from '../hooks/useCountryTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import moment, { Moment } from 'moment';
import DateSlider from './DateSlider';
import { convertDateStrToDate } from '../helper';
import QueryParamsContext from './QueryParamsContext';
import styled from 'styled-components';
import { mapValues, pickBy, Dictionary, isNil, negate } from 'lodash';

const Home = () => {
    const {
        country,
        updateCountry,
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
        data: africaTrends,
        error: africaTrendsError,
        isLoading: africaTrendsLoading,
    } = useAfricaTrends();

    const currentCountryTrends = useMemo(() => {
        if (!country) {
            // If no country is selected lets show all the stats
            return africaTrends || [];
        }
        if (
            allTrendsError ||
            !allCountryTrends ||
            !(country in allCountryTrends)
        ) {
            return [];
        }
        return allCountryTrends[country];
    }, [allCountryTrends, allTrendsError, country]);

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

    const isLoading = country ? allTrendsLoading : africaTrendsLoading;
    const error = country ? allTrendsError : africaTrendsError;

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
            <Row gutter={[16, 16]}>
                <Col md={24} lg={12}>
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
                        onCountrySelect={updateCountry}
                        category={category}
                        dataType={dataType}
                        data={selectedStatsByCountry}
                        loading={isLoading}
                    />
                </Col>
                <Col md={24} lg={12}>
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
