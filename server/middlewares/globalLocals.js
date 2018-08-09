/**
 * @Author: Jet.Chan
 * @Date:   2016-12-05T17:43:06+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-07T14:25:39+08:00
 */

import 'babel-polyfill';

const setRequestLocals = async(ctx, next) => {
    ctx.state.request = ctx.request;
    //全局权限
    if (ctx.session && ctx.session.customer)
        ctx.state.globalCustomer = ctx.session.customer || {};
    return next();
}

export {
    setRequestLocals
}
