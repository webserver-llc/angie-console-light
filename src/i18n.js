import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import appEN from '../locales/en/app.json';
import commonEN from '../locales/en/common.json';
import chartEN from '../locales/en/chart.json';
import demoEN from '../locales/en/demo.json';
import settingsEN from '../locales/en/settings.json';
import cachesEN from '../locales/en/pages/caches.json';
import configfilesEN from '../locales/en/pages/configfiles.json';
import limitConnEN from '../locales/en/pages/serverzones/limitconn.json';
import limitReqEN from '../locales/en/pages/serverzones/limitreq.json';
import locationZonesEN from '../locales/en/pages/serverzones/locationzones.json';
import serverZonesEN from '../locales/en/pages/serverzones/serverzones.json';
import streamUpstreamsEN from '../locales/en/pages/streamupstreams.json';
import upstreamsEN from '../locales/en/pages/upstreams.json';
import resolversEN from '../locales/en/pages/resolvers.json';
import streamZonesEN from '../locales/en/pages/streamzones.json';
import sharedZonesEN from '../locales/en/pages/sharedzones.json';
import tooltipsEN from '../locales/en/pages/tooltips.json';
import aboutAngieEN from '../locales/en/pages/index/aboutangie.json';
import requestsEN from '../locales/en/pages/index/requests.json';
import connectionsEN from '../locales/en/pages/index/connections.json';
import connectionsTooltipsEN from '../locales/en/upstreams/connections-tooltip.json';
import peerTooltipEN from '../locales/en/upstreams/peer-tooltip.json';
import upstreamStatsTooltipEN from '../locales/en/upstreams/upstream-stats-tooltip.json';
import upstreamsContainerEN from '../locales/en/upstreams/upstreams-container.json';
import upstreamServersListEN from '../locales/en/upstreams/upstream-servers-list.json';
import upstreamsListEN from '../locales/en/upstreams/upstreams-list.json';
import upstreamsEditorEN from '../locales/en/upstreams/editor/upstreams-editor.json';

import appRU from '../locales/ru/app.json';
import commonRU from '../locales/ru/common.json';
import chartRU from '../locales/ru/chart.json';
import demoRU from '../locales/ru/demo.json';
import settingsRU from '../locales/ru/settings.json';
import cachesRU from '../locales/ru/pages/caches.json';
import configfilesRU from '../locales/ru/pages/configfiles.json';
import limitConnRU from '../locales/ru/pages/serverzones/limitconn.json';
import limitReqRU from '../locales/ru/pages/serverzones/limitreq.json';
import locationZonesRU from '../locales/ru/pages/serverzones/locationzones.json';
import serverZonesRU from '../locales/ru/pages/serverzones/serverzones.json';
import streamUpstreamsRU from '../locales/ru/pages/streamupstreams.json';
import upstreamsRU from '../locales/ru/pages/upstreams.json';
import resolversRU from '../locales/ru/pages/resolvers.json';
import sharedZonesRU from '../locales/ru/pages/sharedzones.json';
import streamZonesRU from '../locales/ru/pages/streamzones.json';
import tooltipsRU from '../locales/ru/pages/tooltips.json';
import aboutAngieRU from '../locales/ru/pages/index/aboutangie.json';
import requestsRU from '../locales/ru/pages/index/requests.json';
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
		common: commonEN,
		'pages.caches': cachesEN,
		'pages.configfiles': configfilesEN,
		'pages.serverzones.limitconn': limitConnEN,
		'pages.serverzones.limitreq': limitReqEN,
		'pages.serverzones.locationzones': locationZonesEN,
		'pages.serverzones.serverzones': serverZonesEN,
		'pages.streamupstreams': streamUpstreamsEN,
		'pages.upstreams': upstreamsEN,
		'pages.resolvers': resolversEN,
		'pages.sharedzones': sharedZonesEN,
		'pages.streamzones': streamZonesEN,
		'pages.tooltips': tooltipsEN,
		'pages.index.aboutangie': aboutAngieEN,
		'pages.index.connections': connectionsEN,
		'pages.index.requests': requestsEN,
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
		common: commonRU,
		'pages.caches': cachesRU,
		'pages.configfiles': configfilesRU,
		'pages.serverzones.limitconn': limitConnRU,
		'pages.serverzones.limitreq': limitReqRU,
		'pages.serverzones.locationzones': locationZonesRU,
		'pages.serverzones.serverzones': serverZonesRU,
		'pages.streamupstreams': streamUpstreamsRU,
		'pages.upstreams': upstreamsRU,
		'pages.resolvers': resolversRU,
		'pages.sharedzones': sharedZonesRU,
		'pages.streamzones': streamZonesRU,
		'pages.tooltips': tooltipsRU,
		'pages.index.aboutangie': aboutAngieRU,
		'pages.index.connections': connectionsRU,
		'pages.index.requests': requestsRU,
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
		ns: ['common'],
		defaultNS: ['common'],

		fallbackNS: 'common',

		nsSeparator: false,
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
