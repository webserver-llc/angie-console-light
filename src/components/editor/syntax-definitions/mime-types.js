/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint-disable import/prefer-default-export */
export const tokenProvider = {
	defaultToken: 'source',
	tokenizer: {
		root: [
			[/[ \t\r\n]+/, ''],
			[ /types/, 'keyword' ],
			[ /[{}]/, 'bracket.curvy' ],
			[ /(text|application|audio|video|image|font)\/[A-Za-z-0-9+.]+/, 'attribute.name'],
			[ /([A-Za-z0-9])+/, 'attribute.value' ],
			[ /([A-Za-z0-9-+.]+)(;)/, { cases: { $2: ['attribute.value', 'delimeter'] } } ]
		],
	}
};
