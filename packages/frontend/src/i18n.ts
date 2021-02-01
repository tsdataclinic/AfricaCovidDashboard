import i18n from 'i18next';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';
import translationEN from './translation/en.json'; // ENGLISH
import translationFR from './translation/fr.json'; // FRENCH
import translationPT from './translation/pt.json'; // PORTUGUESE
import translationAR from './translation/ar.json'; // ARABIC
import translationSW from './translation/sw.json'; // SWAHILI

import LanguageDetector from 'i18next-browser-languagedetector';
import countries from 'i18n-iso-countries';
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));
countries.registerLocale(require('i18n-iso-countries/langs/pt.json'));
countries.registerLocale(require('i18n-iso-countries/langs/ar.json'));

const resources = {
    en: {
        translation: translationEN,
    },
    fr: {
        translation: translationFR,
    },
    pt: {
        translation: translationPT,
    },
    ar: {
        translation: translationAR,
    },
    sw: {
        translation: translationSW,
    },
};

i18n.on('languageChanged', function (lng) {
    moment.locale(lng);
});

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        debug: true,
        resources,
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
