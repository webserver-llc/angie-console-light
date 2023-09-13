/**
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const ESLintPlugin = require('eslint-webpack-plugin');

const package = require('./package.json');
const ENV = process.env.NODE_ENV || 'development';
const PRODUCTION_BUILD = ENV === 'production';
const FILE_NAME = process.env.FILE_NAME || 'console_dev';
const CONSOLE_TYPE = process.env.CONSOLE_TYPE || 'console';
const PROXY_TARGET = process.env.PROXY_TARGET || 'https://console.angie.software';

const plugins = [
    new HtmlWebpackPlugin({
        title: 'Angie Console Light',
        filename: `${FILE_NAME}.html`,
        template: 'src/index.ejs',
        ...(
            PRODUCTION_BUILD
                ? { inject: 'body' }
                : {}
        )
    }),

    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(ENV),
        __ENV__: JSON.stringify(CONSOLE_TYPE),
        __APP_VERSION__: JSON.stringify(package.version),
    }),

    new ESLintPlugin(),
];

if (PRODUCTION_BUILD) {
    plugins.push(new HTMLInlineCSSWebpackPlugin());
    plugins.push(new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.js$/]));
}

const cssLoaderConfiguration = (() => {
    const use = [
        {
            loader: 'css-loader',
            options: {
                modules: {
                    localIdentName: '[local]___[hash:base64:5]',
                },
                importLoaders: 1,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: () => [
                        require('autoprefixer')({
                            env: 'last 5 versions and not ie < 11',
                        }),
                        require('cssnano')({
                            preset: 'default',
                        }),
                    ]
                }
            }
        }
    ];

    if (PRODUCTION_BUILD) {
        plugins.push(
            new MiniCssExtractPlugin({
                filename: 'index.css',
            })
        );
        use.unshift(MiniCssExtractPlugin.loader);
    } else {
        use.unshift('style-loader');
    }

    return {
        test: /\.css$/,
        use
    };
})();

const babelOptions = {
    presets: [
        "@babel/preset-react",
        ["@babel/preset-env", {
            "targets": {
                "browsers": ["last 5 versions", "not ie < 11"],
            },
            "useBuiltIns": "usage",
            "corejs": 3,
        }],
    ],
    plugins: [
        "@babel/plugin-transform-runtime",
        ["@babel/plugin-proposal-object-rest-spread", {
            "useBuiltIns": true,
            "corejs": 3,
        }],
    ],
};

if (!PRODUCTION_BUILD) {
    babelOptions.plugins.unshift(
        ["istanbul", { "exclude": ["src/**/__test__/*"] }]
    );
}

const config = {
    mode: PRODUCTION_BUILD ? 'production' : 'development',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.join(__dirname, '/dist/'),
        publicPath: '/',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '/dist/')
        },
        hot: true,
        port: 8082,
        proxy: [{
            context: ['/api', '/status'],
            target: PROXY_TARGET,
            secure: true,
            changeOrigin: true
        }],
        devMiddleware: {
            writeToDisk: true
        },
        historyApiFallback: {
            index: `${FILE_NAME}.html`,
        },
    },
    plugins,

    resolve: {
        alias: {
            'react': path.resolve(__dirname, 'src/preact-exports.js'),
            '#': path.resolve(__dirname, 'src'),
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: babelOptions,
                },
            },
            {
                test: /\.(woff|svg)$/,
                type: 'asset/inline',
            },
            cssLoaderConfiguration
        ]
    },
    performance: {
        maxEntrypointSize: 1000000,
        maxAssetSize: 1000000
    }
};

if (!PRODUCTION_BUILD) {
    config.devtool = 'inline-source-map';
}

module.exports = config;
