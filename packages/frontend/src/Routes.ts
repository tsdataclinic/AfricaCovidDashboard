import Home from './components/Home';
import About from './components/About';
import { Legal } from './components/Legal';
import { Feedback } from './components/Feedback';

interface RouteProps {
    path: string;
    component: React.SFC<any>;
}

export const HOME_PATH = '/';
export const ABOUT_PATH = '/about';
export const LEGAL_PATH = '/legal';
export const FEEDBACK_PATH = '/feedback';

const routes: RouteProps[] = [
    {
        path: `${HOME_PATH}`,
        component: Home,
    },
    {
        path: ABOUT_PATH,
        component: About,
    },
    {
        path: LEGAL_PATH,
        component: Legal,
    },
    {
        path: FEEDBACK_PATH,
        component: Feedback,
    },
];

export default routes;
