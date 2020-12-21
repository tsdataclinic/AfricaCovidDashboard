import Home from './components/Home';
import About from './components/About';

interface RouteProps {
    path: string;
    component: React.SFC<any>;
}

export const HOME_PATH = '/';
export const ABOUT_PATH = '/about';

const routes: RouteProps[] = [
    {
        path: `${HOME_PATH}`,
        component: Home,
    },
    {
        path: ABOUT_PATH,
        component: About,
    },
];

export default routes;
