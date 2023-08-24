export const docs = {
	pro: 'https://wbsrv.ru/angie-pro/docs/',
	default: 'https://angie.software/en/',
};

export const getHrefDocs = (build) => {
	if (!build) return docs.default;
	if (build.toLowerCase().indexOf('pro') !== -1) return docs.pro;
	return docs.default;
};

export default {
	docs,
	getHrefDocs,
};
