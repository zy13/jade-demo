/**
 * @Author: Jet.Chan
 * @Date:   2016-11-25T14:20:12+08:00
 * @Email:  guanjie.chen@talebase.com
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2016-11-25T15:42:13+08:00
 */
'use strict';

var gulp = require('gulp'),
    path = require('path'),
    gutil = require('gulp-util'),
    webpack = require('webpack');

// create optimizations array
var optimizations = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false,
        },
        compress: {
            warnings: false,
        },
    })
];

gulp.task('build.test', function(callback) {

    var wpConfig = require('../config/webpack.config.test');
    if (wpConfig.plugins) {
        wpConfig.plugins = wpConfig.plugins.concat(optimizations);
    } else {
        wpConfig.plugins = optimizations;
    }
    // run webpack
    webpack(wpConfig, function(err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack', err);
        }
        // only log when errors
        gutil.log('[webpack]: ', stats.toString({
            chunks: false,
            modules: false,
            colors: true,
        }));
        callback();
    });
});

gulp.task('build.production', function(callback) {

    var wpConfig = require('../config/webpack.config.production');
    if (wpConfig.plugins) {
        wpConfig.plugins = wpConfig.plugins.concat(optimizations);
    } else {
        wpConfig.plugins = optimizations;
    }
    // run webpack
    webpack(wpConfig, function(err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack', err);
        }
        // only log when errors
        gutil.log('[webpack]: ', stats.toString({
            chunks: false,
            modules: false,
            colors: true,
        }));
        callback();
    });
});