/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* global __ENV__ */
export const isDemoEnv = () => __ENV__ === 'demo';

export default {
	isDemoEnv
};
