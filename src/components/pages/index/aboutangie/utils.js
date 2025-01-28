/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { apiUtils } from '../../../../api';

export const docs = {
	pro: 'https://angie.software/angie/docs/',
	default: 'https://angie.software/en/',
};

export const getHrefDocs = () => apiUtils.isAngiePro() ? docs.pro : docs.default;

export default {
	docs,
	getHrefDocs,
};
