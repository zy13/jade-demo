/*
 * @Author: dser.wei
 * @Date:   2016-06-23 18:44:37
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-06T16:54:53+08:00
 */

'use strict';

var path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    _ = require('lodash'),
    AssetsPlugin = require('assets-webpack-plugin'),
    assetsPluginInstance = new AssetsPlugin({
        filename: 'assets.json',
        path: path.resolve(__dirname, '../', 'build')
    }),
    os = require('os');

//path
var rootPath = path.resolve(__dirname, '../');
var nodeModulePath = path.resolve(rootPath, 'node_modules');
var appPath = path.resolve(rootPath, 'src');

//setting
var getAppConfig = require('./configHelper');

module.exports = function(opts) {
    //options
    var opt = _.extend({
        dev: true,
        debug: true,
        NODE_ENV: 'development'
    }, opts || {});

    var appConfig = getAppConfig(opt.NODE_ENV) || {};

    //entries
    var entryHelper = require('./entryHelper');
    var entries = entryHelper.getEntry(appConfig);

    var staticPort = appConfig.static.staticPort.length > 0 ? appConfig.static.staticPort : '';

    //entries setting
    if (opt.dev) {
        Object.keys(entries).forEach(function(v) {
            entries[v] = ['webpack-hot-middleware/client?path=http://localhost:' + staticPort + '/__webpack_hmr&timeout=20000&reload=true', entries[v]];
        });
    }

    var definePluginInstance = new webpack.DefinePlugin({
        __DEV__: JSON.stringify(JSON.parse(opt.NODE_ENV === 'development' ? 'true' : 'false')),
        AppConfig: JSON.stringify(appConfig),
        "process.env": {
            BROWSER: JSON.stringify(true),
            NODE_ENV: JSON.stringify(opt.NODE_ENV)
        }
    });

    var publicPath = '/assets/';
    if (appConfig.static.staticDomain.length > 0) {
        publicPath = appConfig.static.staticDomain + (staticPort ? ':' + staticPort : '') + publicPath;
    }
    var isDynamicStaticDomain = opt.dev || (!publicPath.includes('{domain}') && !publicPath.includes('cdn'));
    entries['vendors'] = ['jquery', 'q', 'c-ui', 'juicer', 'lodash', 'mockjs', 'moment', 'babel-polyfill', 'store2'];
    //base config obj
    var conf = {
        devtool: opt.debug && opt.sourceMap ? '#source-map' : '',
        //debug: opt.debug,
        entry: entries,
        output: {
            path: path.resolve(rootPath, 'public/assets/'),
            publicPath: publicPath,
            filename: '[name].[chunkhash].min.js'
        },
        node: {
            fs: 'empty',
        },
        module: {
            loaders: [{
                test: /\.css$/,
                loader: opt.dev ? 'style!css' : ExtractTextPlugin.extract('style', 'css'),
                include: nodeModulePath
            }, {
                test: /\.less$/,
                loader: opt.dev ? 'style!css!less' : ExtractTextPlugin.extract('style', 'css!less'),
                include: [appPath, nodeModulePath]
            }, {
                test: /\.scss$/,
                loader: opt.dev ? 'style!css!sass' : ExtractTextPlugin.extract('style', 'css!sass'),
                include: appPath
            }, {
                test: /\.styl$/,
                loader: opt.dev ? 'style!css!stylus' : ExtractTextPlugin.extract('style', 'css!stylus'),
                include: appPath
            }, {
                test: /\.woff\d?(\?.+)?$/,
                loader: 'url?limit=1000&minetype=application/font-woff' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
                include: nodeModulePath
            }, {
                test: /\.ttf(\?.+)?$/,
                loader: 'url?limit=1000&minetype=application/octet-stream' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
                include: nodeModulePath
            }, {
                test: /\.eot(\?.+)?$/,
                loader: 'url?limit=1000' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
                include: nodeModulePath
            }, {
                test: /\.svg(\?.+)?$/,
                loader: 'url?limit=1000&minetype=image/svg+xml' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
                include: nodeModulePath
            }, {
                test: /\.png$/,
                loader: 'url?limit=1000&mimetype=image/png' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
            }, {
                test: /\.jpg$/,
                loader: 'url?limit=1000&mimetype=image/jpg' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/'),
            }, {
                test: /\.gif$/,
                loader: 'url?limit=1000&mimetype=image/gif' + (isDynamicStaticDomain ? '' : '&publicPath=/assets/')
            }, {
                test: /\.json$/,
                loader: 'json',
                include: appPath
            }, {
                test: /(\/|\\)tpl(\/|\\).*(\.html)$/,
                loader: 'html?config=htmlLoaderConfig'
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', "stage-3"],
                    plugins: ['transform-runtime'],
                    cacheDirectory: os.tmpdir() + '/babel_cache/'
                },
            }]
        },
        htmlLoaderConfig: {
            removeAttributeQuotes: false,
            minimize: true
        },
        plugins: [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendors',
                filename: 'vendors.js?[hash:8]',
                minChunks: Infinity
            }),
            new webpack.NoErrorsPlugin(),
            assetsPluginInstance,
            definePluginInstance,
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            })
        ],
    };

    //plugins setting
    if (opt.dev) {
        //开发模式下加入热替换插件
        conf.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
    } else {
        //非开发模式下生成css文件
        conf.plugins.push(
            new ExtractTextPlugin('css/[name].[chunkhash].css', {
                //disable: false,
                allChunks: true
            })
        );
    }

    return conf;
}
