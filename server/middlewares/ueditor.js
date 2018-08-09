/**
 * @Author: Jet.Chan
 * @Date:   2016-12-08T15:06:29+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-03T13:32:07+08:00
 */

import Ueditor from './ueditor.Handler';
import Router from 'koa-router';
import convert from 'koa-convert';
import betterBody from 'koa-better-body';


//router.all('/ueditor/ue', ueditor);
export default (app, staticPath) => {

    const router = Router();

    let ueditor = Ueditor(staticPath);

    router.all('/ueditor/use', convert(betterBody({
        multipart: true
    })), convert(ueditor));


    app.use(router.routes()).use(router.allowedMethods());
}
