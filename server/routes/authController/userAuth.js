/**
* @Author: Jet.Chan
* @Date:   2016-11-24T11:49:03+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-05T17:59:54+08:00
*/

const redirectUrl=`<script>window.top.location.href="/exam/login"</script>`
export default async(ctx, next) => {
    if (!ctx.session || !ctx.session.user) {
        ctx.redirect('/exam/login');
        ctx.body = redirectUrl;
        return;
    } else {
        //TODO：权限相关

        //通过则 return next();
        return next();
    }
};
