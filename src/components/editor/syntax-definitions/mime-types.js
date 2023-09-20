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
