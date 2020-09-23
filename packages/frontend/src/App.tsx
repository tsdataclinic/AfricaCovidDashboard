import React from 'react';
import styled from 'styled-components';
import AppLayout from './components/Layout';

import { QueryCache, ReactQueryCacheProvider } from 'react-query';

const queryCache = new QueryCache();

function App() {
    return (
        <ReactQueryCacheProvider queryCache={queryCache}>
            <Shell>
                <AppLayout />
            </Shell>
        </ReactQueryCacheProvider>
    );
}

const Shell = styled.div`
    text-align: center;
`;

export default App;
