import React from 'react';
import { useParams } from 'react-router-dom';
import { CountryParam } from '../types';
import Country from './Country';

const Home = () => {
    const { country } = useParams<CountryParam>();
    if (country) {
        return <Country />;
    }
    return <div>Home</div>;
};

export default Home;
