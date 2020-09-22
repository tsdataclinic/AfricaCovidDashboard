import React from 'react';
import styled from 'styled-components';
<<<<<<< HEAD
import AppLayout from './components/Layout';
=======
import { useTranslation } from 'react-i18next';
import LanguagePanel from './components/LanguagePanel';
import {
    useQueryCache,
    QueryCache,
    ReactQueryCacheProvider
} from 'react-query';

const queryCache = new QueryCache();
>>>>>>> 237f630... adding basic hooks for data fetching

function App() {
    return (
<<<<<<< HEAD
        <Shell>
            <AppLayout />
        </Shell>
=======
        <ReactQueryCacheProvider queryCache={queryCache}>
            <Shell>
                <AppHeader>
                    <p>{t('Africa COVID Dashboard')}</p>
                    <LanguagePanel />
                </AppHeader>
            </Shell>
        </ReactQueryCacheProvider>
>>>>>>> 237f630... adding basic hooks for data fetching
    );
}

const Shell = styled.div`
    text-align: center;
`;

export default App;
