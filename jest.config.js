/** @type {import('jest').Config} */
module.exports = {
	globals: {
		__APP_VERSION__: '1.0.0',
		__ENV__: ''
	},
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
		'\\.(css|less)$': 'identity-obj-proxy',
		'^react$': 'preact/compat',
		'^react-dom/test-utils$': 'preact/test-utils',
		'^react-dom$': 'preact/compat',
		'^react/jsx-runtime$': 'preact/jsx-runtime',
		'^preact(/(.*)|$)': 'preact$1',
		'^#/(.*)$': '<rootDir>/src/$1'
	},
	transformIgnorePatterns: [
		'/node_modules/(?!(preact|foo)/)'
	],
	transform: {
		'\\.[jt]sx?$': 'babel-jest'
	},
	setupFilesAfterEnv: [
		'<rootDir>/setupTests.js'
	]
};
