/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import { apiUtils } from '../api';

// eslint-disable-next-line no-unused-vars
export default (angie, previous, STORE) => {
	if (angie === null) {
		return null;
	}
	apiUtils.defineAngieVersion(angie.build);
	return angie;
};
