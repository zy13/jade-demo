/**
 * @Author: Jet.Chan
 * @Date:   2016-11-24T15:24:02+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-24T15:25:07+08:00
 */


import KoaRouter from "koa-router"

export default (opts) => {
    const router = KoaRouter();
    if (opts && opts.prefix && typeof opts.prefix === 'string') {
        router.prefix(opts.prefix);
    }

    if (opts && opts.default && typeof opts.default === 'function') {
        router.get('/', opts.default);
        router.get('/index', opts.default);
    }
    return router;
};
