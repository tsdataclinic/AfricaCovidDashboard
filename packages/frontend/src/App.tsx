import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AppLayout from './components/Layout';
import Routes from './Routes';
import { ReactQueryDevtools } from 'react-query-devtools';
import Fathom from 'fathom-react';
import { QueryParamsProvider } from './contexts/QueryParamsContext';

import { QueryCache, ReactQueryCacheProvider } from 'react-query';

const queryCache = new QueryCache({
    defaultConfig: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    const children = useMemo(
        () =>
            Routes.map((page, index) => (
                <Route
                    exact
                    path={page.path}
                    render={(props) => (
                        <AppLayout>
                            <page.component {...props} />
                        </AppLayout>
                    )}
                    key={index}
                />
            )),
        []
    );
    return (
        <Fathom siteId={'NGCVAEYE'}>
            <ReactQueryCacheProvider queryCache={queryCache}>
                <BrowserRouter>
                    <QueryParamsProvider>
                        <Shell>
                            <Switch>
                                {children}
                                <Redirect to="/" />
                            </Switch>
                        </Shell>
                    </QueryParamsProvider>
                </BrowserRouter>
                <ReactQueryDevtools initialIsOpen />
            </ReactQueryCacheProvider>
        </Fathom>
    );
}

const Shell = styled.div`
    text-align: center;
`;

export default App;
