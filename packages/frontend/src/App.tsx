import React from 'react';
import styled from 'styled-components';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AppLayout from './components/Layout';
import Routes from './Routes';

import { QueryCache, ReactQueryCacheProvider } from 'react-query';

const queryCache = new QueryCache();

function App() {
    return (
        <ReactQueryCacheProvider queryCache={queryCache}>
            <BrowserRouter>
                <Shell>
                    <Switch>
                        {Routes.map((page, index) => (
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
                        ))}
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
