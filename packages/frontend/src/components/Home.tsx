import React, { useMemo, useCallback, useContext } from 'react';
import AfricaMap from './africa-map/AfricaMap';
import { Col, Row, Skeleton } from 'antd';
import { useCountryTrends } from '../hooks/useCountryTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';
import { Moment } from 'moment';
import DateSlider from './DateSlider';
import { convertDateStrToDate } from '../helper';
import QueryParamsContext from './QueryParamsContext';
import { useAllTrends } from '../hooks/useAllTrends';

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
        data: countryTrendData,
        isFetching: isFetchingTrend,
        isLoading,
        error,
    } = useCountryTrends(country);

    const { data: allCountryTrends } = useAllTrends();

    const countryTrend = useMemo(() => {
        if (error || !Array.isArray(countryTrendData)) {
            return [];
        }
        return countryTrendData;
    }, [error, countryTrendData]);

    const dates = useMemo(
        () => countryTrend.map((item) => convertDateStrToDate(item.date)),
        [countryTrend]
    );

    const onSelectDate = useCallback(
        (value: Moment) => {
            updateQuery('selectedDate', value);
        },
        [updateQuery]
    );

    const selectedStats = useMemo(
        () =>
            countryTrend.find((item) => selectedDate?.isSame(item.date, 'day')),
        [selectedDate, countryTrend]
    );

    if (isLoading) {
        return <Skeleton active />;
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
                        loading={isFetchingTrend}
                        data={selectedStats}
                    />
                    <AfricaMap
                        selectedCountry={country}
                        onCountrySelect={updateCountry}
                        category={category}
                        date={selectedDate}
                        dataType={dataType}
                        data={allCountryTrends}
                    />
                </Col>
                <Col md={24} lg={12}>
                    <Trend
                        trendData={countryTrend}
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

export default Home;
