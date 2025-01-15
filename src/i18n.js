import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import appEN from '../locales/en/app.json';
import chartEN from '../locales/en/chart.json';
import demoEN from '../locales/en/demo.json';
import settingsEN from '../locales/en/settings.json';
import cacheEN from '../locales/en/pages/cache.json';
import connectionsEN from '../locales/en/pages/index/connections.json';
import connectionsTooltipsEN from '../locales/en/upstreams/connections-tooltip.json';
import peerTooltipEN from '../locales/en/upstreams/peer-tooltip.json';
import upstreamStatsTooltipEN from '../locales/en/upstreams/upstream-stats-tooltip.json';
import upstreamsContainerEN from '../locales/en/upstreams/upstreams-container.json';
import upstreamServersListEN from '../locales/en/upstreams/upstream-servers-list.json';
import upstreamsListEN from '../locales/en/upstreams/upstreams-list.json';
import upstreamsEditorEN from '../locales/en/upstreams/editor/upstreams-editor.json';

import appRU from '../locales/ru/app.json';
import chartRU from '../locales/ru/chart.json';
import demoRU from '../locales/ru/demo.json';
import settingsRU from '../locales/ru/settings.json';
import cacheRU from '../locales/ru/pages/cache.json';
import connectionsRU from '../locales/ru/pages/index/connections.json';
import connectionsTooltipsRU from '../locales/ru/upstreams/connections-tooltip.json';
import peerTooltipRU from '../locales/ru/upstreams/peer-tooltip.json';
import upstreamStatsTooltipRU from '../locales/ru/upstreams/upstream-stats-tooltip.json';
import upstreamsContainerRU from '../locales/ru/upstreams/upstreams-container.json';
import upstreamServersListRU from '../locales/ru/upstreams/upstream-servers-list.json';
import upstreamsListRU from '../locales/ru/upstreams/upstreams-list.json';
import upstreamsEditorRU from '../locales/ru/upstreams/editor/upstreams-editor.json';

const resources = {
	en: {
		app: appEN,
		chart: chartEN,
		demo: demoEN,
		settings: settingsEN,
		'pages.cache': cacheEN,
		'pages.index.connections': connectionsEN,
		'upstreams.connections-tooltip': connectionsTooltipsEN,
		'upstreams.peer-tooltip': peerTooltipEN,
		'upstreams.upstream-stats-tooltip': upstreamStatsTooltipEN,
		'upstreams.upstreams-container': upstreamsContainerEN,
		'upstreams.upstream-servers-list': upstreamServersListEN,
		'upstreams.upstreams-list': upstreamsListEN,
		'upstreams.editor.upstreams-editor': upstreamsEditorEN
	},
	ru: {
		app: appRU,
		chart: chartRU,
		demo: demoRU,
		settings: settingsRU,
		'pages.cache': cacheRU,
		'pages.index.connections': connectionsRU,
		'upstreams.connections-tooltip': connectionsTooltipsRU,
		'upstreams.peer-tooltip': peerTooltipRU,
		'upstreams.upstream-stats-tooltip': upstreamStatsTooltipRU,
		'upstreams.upstreams-container': upstreamsContainerRU,
		'upstreams.upstream-servers-list': upstreamServersListRU,
		'upstreams.upstreams-list': upstreamsListRU,
		'upstreams.editor.upstreams-editor': upstreamsEditorRU
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
