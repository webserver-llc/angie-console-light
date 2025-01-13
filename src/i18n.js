import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import connectionsEN from '../locales/en/pages/index/connections.json';
import connectionsRU from '../locales/ru/pages/index/connections.json';

const resources = {
	en: {
		'page.index.connections': connectionsEN,
	},
	ru: {
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
