import React from 'react';
import Country from './Country';
import AfricaMap from './africa-map/AfricaMap';
import { Col, Row } from 'antd';
import useQueryParams from '../hooks/useQueryParams';

const Home = () => {
    const { country, updateCountry } = useQueryParams();

    return (
        <Row gutter={[16, 16]}>
            <Col span={12}>
                <AfricaMap
                    selectedCountry={country}
                    onCountrySelect={updateCountry}
                />
            </Col>
            <Col span={12}>{country && <Country />}</Col>
        </Row>
    );
};

export default Home;
