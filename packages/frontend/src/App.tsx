import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AppLayout from './components/Layout';
import Routes from './Routes';

import { QueryCache, ReactQueryCacheProvider } from 'react-query';

const queryCache = new QueryCache();

function App() {
    const children = useMemo(
        () =>
            Routes.map((page, index) => (
                <Route
                    exact
                    path={page.path}
                    render={props => (
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
        <ReactQueryCacheProvider queryCache={queryCache}>
            <BrowserRouter>
                <Shell>
                    <Switch>
                        {children}
                        <Redirect to="/" />
                    </Switch>
                </Shell>
            </BrowserRouter>
        </ReactQueryCacheProvider>
    );
}

const Shell = styled.div`
    text-align: center;
`;

export default App;
