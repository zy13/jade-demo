/**
 * @Author: Jet.Chan
 * @Date:   2017-01-23T18:33:16+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T11:28:32+08:00
 */

import 'babel-polyfill';

export default async(ctx, next) => {
    if (ctx.app.env != 'development') {
        try {
            await next();
            if (ctx.status == 404) {
                return ctx.redirect(`/common/error/${ctx.status}`);
            }
        } catch (e) {
            if (typeof e == 'string') {
                if (e.indexOf('statusCode:403') > -1) {
                    ctx.status = 403;
                } else if (e.indexOf('statusCode:502') > -1) {
                    ctx.status = 502;
                } else {
                    ctx.status = 500;
                }
            } else if (e.data && e.data.code == 29000001) {
                //自动注销登录
                ctx.session = null;
            } else {
                ctx.status = 500;
            }
            ctx.app.emit('error', e, ctx);
        }
    } else {
        return next();
    }
}
