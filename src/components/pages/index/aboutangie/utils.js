import { apiUtils } from '../../../../api';

export const docs = {
	pro: 'https://wbsrv.ru/angie-pro/docs/',
	default: 'https://angie.software/en/',
};

export const getHrefDocs = () => apiUtils.isAngiePro() ? docs.pro : docs.default;

export default {
	docs,
	getHrefDocs,
};
