/**
 * @Author: Jet.Chan
 * @Date:   2016-11-24T11:40:05+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-05T17:58:22+08:00
 */

const redirectUrl=`<script>window.top.location.href="/customer/logout"</script>`

export default async(ctx, next) => {
    if (!ctx.session || !ctx.session.customer) {
        //ctx.redirect('/customer/user/login');
        ctx.body = redirectUrl;
        return;
    } else {
        //TODO：权限相关
        //doSomething code

        //通过则 return next();
        return next();
    }
};
