import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import appEN from '../locales/en/app.json';
import chartEN from '../locales/en/chart.json';
import settingsEN from '../locales/en/settings.json';
import connectionsEN from '../locales/en/pages/index/connections.json';

import appRU from '../locales/ru/app.json';
import chartRU from '../locales/ru/chart.json';
import settingsRU from '../locales/ru/settings.json';
import connectionsRU from '../locales/ru/pages/index/connections.json';

const resources = {
	en: {
		app: appEN,
		chart: chartEN,
		settings: settingsEN,
		'page.index.connections': connectionsEN,
	},
	ru: {
		app: appRU,
		chart: chartRU,
		settings: settingsRU,
		'page.index.connections': connectionsRU,
	}
};

i18n
	.use(LanguageDetector)
	.use(reactI18nextModule)
	.init({
		supportedLngs: ['en', 'ru'],

		resources,
		fallbackLng: 'en',
		debug: process.env.NODE_ENV === 'development',

		keySeparator: false,

		interpolation: {
			escapeValue: false
		},

		react: {
			defaultTransParent: 'div',
			wait: true,
		},
	});

export default i18n;
