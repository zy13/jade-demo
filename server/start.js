/**
 * @Author: Jet.Chan
 * @Date:   2016-11-15T11:58:23+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-15T16:58:34+08:00
 */
import app from './app'
// import Debug from 'debug'
// const debug = Debug()

import http from 'http'

import consoler from 'consoler'

import logger from './util/logger'


const port = parseInt(process.env.PORT || '3000')
const server = http.createServer(app.callback())

server.listen(port)
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(port + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(port + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
})
server.on('listening', () => {
    console.log('Listening on port: %d', port)

    const addr = server.address();
    const bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    // debug('Listening on ' + bind);
    consoler.info('The Main Server is Listening On ' + bind);
    logger.other('The Main Server is Listening On ' + bind);
})
