module.exports = {
	presets: [
		[
			'@babel/preset-react',
			{
				targets: {
					browsers: [
						'last 5 versions',
						'not ie < 11'
					]
				},
				useBuiltIns: 'usage',
				corejs: 3
			}
		],
		'@babel/preset-env'
	],
	plugins: [
		'@babel/plugin-transform-runtime',
		[
			'@babel/plugin-proposal-object-rest-spread',
			{
				useBuiltIns: true,
				corejs: 3
			}
		]
	]
};
