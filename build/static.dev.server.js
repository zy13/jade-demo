/*
 * @Author: dser.wei
 * @Date:   2016-06-23 16:32:06
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-07T12:06:11+08:00
 */

'use strict';

var Koa = require('koa'),
    path = require('path'),
    http = require('http'),
    debug = require('debug')('demo:server'),
    consoler = require('consoler'),
    cors = require('koa-cors'),
    convert = require('koa-convert'),
    webpack = require('webpack'),
    devMiddleware = require('koa-webpack-dev-middleware'),
    hotMiddleware = require('koa-webpack-hot-middleware'),
    conf = require('../config/webpack.config.dev');

var options = {
    origin: '*'
}

console.log('conf', conf)

var app = new Koa();

app.use(convert(cors(options)));

var compiler = webpack(conf)

app.use(convert(devMiddleware(compiler, {
    // all options optional

    noInfo: true,
    // display no info to console (only warnings and errors)

    quiet: false,
    // display nothing to the console

    /*lazy: true,*/
    // switch into lazy mode
    // that means no watching, but recompilation on every request

    /*watchOptions: {
        aggregateTimeout: 300,
        poll: true
    },*/
    // watch options (only lazy: false)

    publicPath: conf.output.publicPath,
    // public path to bind the middleware to
    // use the same as in webpack

    /*headers: { "X-Custom-Header": "yes" },*/
    // custom headers

    stats: {
        colors: true
    }
    // options for formating the statistics
})));

app.use(convert(hotMiddleware(compiler, {
    path: '/__webpack_hmr'
})));


consoler.info('请等待webpack初次构建完成提示...');



/**
 * Get port from environment and store in Express.
 */

var port = normalizePort('9001');
// app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    consoler.info('The Static Dev Server is Listening On ' + port);
}
