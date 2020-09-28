import React from 'react';
import Country from './Country';
import AfricaMap from './africa-map/AfricaMap';
import { Col, Row } from 'antd';
import useQueryParams from '../hooks/useQueryParams';
import { useCountryTrends } from '../hooks/useCountryTrends';
import StatsBar from './StatsBar';
import Trend from './Trend';

const Home = () => {
    const {
        country,
        updateCountry,
        dataType,
        category,
        updateQuery,
    } = useQueryParams();

    const {
        data: countryTrends,
        isFetching: isFetchingTrends,
        error: countryTrendsError,
    } = useCountryTrends(country);

    return (
        <Row gutter={[16, 16]}>
            <Col md={24} lg={12}>
                <StatsBar
                    dataType={dataType}
                    category={category}
                    selectCategory={(category) =>
                        updateQuery('category', category)
                    }
                    loading={isFetchingTrends}
                    data={
                        typeof countryTrends == 'object' &&
                        Array.isArray(countryTrends) &&
                        countryTrends.slice(-1).pop()
                    }
                />
                <AfricaMap
                    selectedCountry={country}
                    onCountrySelect={updateCountry}
                />
            </Col>
            <Col md={24} lg={12}>
                <Trend />
            </Col>
        </Row>
    );
};

export default Home;
