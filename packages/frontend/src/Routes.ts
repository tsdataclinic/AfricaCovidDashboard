import Home from './components/Home';
import Country from './components/Country';
import Forecast from './components/Forecast';
import About from './components/About';

interface RouteProps {
    path: string;
    component: React.SFC<any>;
}

export const HOME_PATH = '/';
export const COUNTRY_PATH = '/country';
export const FORECAST_PATH = '/forcast';
export const ABOUT_PATH = '/about';

const routes: RouteProps[] = [
    {
        path: HOME_PATH,
        component: Home,
    },
    {
        path: `${COUNTRY_PATH}/:country`,
        component: Country,
    },
    {
        path: FORECAST_PATH,
        component: Forecast,
    },
    {
        path: ABOUT_PATH,
        component: About,
    },
];

export default routes;
