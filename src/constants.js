/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * All rights reserved.
 *
 */
/* global __APP_VERSION__ */

export const VERSION = __APP_VERSION__; // __APP_VERSION__ from package.json
export const DEFAULT_UPDATING_PERIOD = 1000;
export const DEFAULT_CACHE_DATA_INTERVAL = 300 * 1000;
export const MIN_CACHE_DATA_INTERVAL = 30 * 1000;
export const MAX_CACHE_DATA_INTERVAL = 3600 * 1000;
export const DEFAULT_4XX_THRESHOLD_PERCENT = 30;
export const DEFAULT_ZONESYNC_PENDING_THRESHOLD_PERCENT = 70;
export const DEFAULT_RESOLVER_ERRORS_THRESHOLD_PERCENT = 3;

export const API_CURRENT_VERSION = 8;
export const API_PREFIX = '/api';
export const API_PATH = `${API_PREFIX}/${API_CURRENT_VERSION}`;
