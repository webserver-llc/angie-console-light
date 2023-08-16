export const docs = {
	pro: 'https://wbsrv.ru/angie-pro/docs/',
	default: 'https://angie.software/en/',
};

export const getHrefDocs = (build) => {
	if (!build) return docs.default;
	return docs[build.toLowerCase()] || docs.default;
};

export default {
	docs,
	getHrefDocs,
};
