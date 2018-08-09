/**
 * @Author: Jet.Chan
 * @Date:   2016-11-11T12:00:07+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T11:28:38+08:00
 */
import Koa from 'koa'
import koaLogger from 'koa-logger'
import Bodyparser from 'koa-bodyparser'
import json from 'koa-json'
import KoaJade from 'koa-jade'
import path from 'path'
import logger from './util/logger'
import convert from 'koa-convert'
import onerror from 'koa-onerror'
import KoaStatic from 'koa-static'
import pageHelper from './util/pageHelper'
import KoaSession from 'koa-session'
const app = new Koa()
const bodyparser = Bodyparser()

app.use(async(ctx, next) => {
    const start = new Date();
    return next().then(() => {
        const ms = new Date() - start;
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    });
});

import errorHandler from "./middlewares/error.Handler";
app.use(errorHandler);

app.use(convert(bodyparser))
app.use(convert(json()))
app.use(convert(koaLogger()))

const staticPath = path.join(__dirname, '../', 'public');
app.use(convert(KoaStatic(staticPath)))

//views
const jadeViews = new KoaJade({
    viewPath: __dirname + '/views',
    debug: false,
    helperPath: [{
        pageHelper: pageHelper
    }]
})
app.use(convert(jadeViews.middleware))

//appConfig middleware
const env = process.env.NODE_ENV || 'development'
import appConfig from '../config/configHelper'
app.use(convert(appConfig.config(app, env)))

//session
app.keys = ['user context']
app.use(convert(KoaSession(app)))

import {
    setRequestLocals
} from "./middlewares/globalLocals"
app.use(setRequestLocals)

//i18n
import i18nUse from './middlewares/koa.i18n';
i18nUse(app);

//ueditor 上传附件图片等路由
import ueditorRoute from './middlewares/ueditor';
ueditorRoute(app, 'public')

//routes
import routes from './routes'
routes(app)

//500 error
onerror(app)


app.on('error', async(err, ctx) => {
    logger.error({
        err: err ? err.toString() : 'unknow',
        ctx: ctx || '',
        errorPosition: err.stack
    });

    if (process.env.NODE_ENV == 'development') {
        ctx.body = err.stack
    } else {
        if (ctx.header.hasOwnProperty('x-requested-with') && ctx.header['x-requested-with'] == 'XMLHttpRequest') {
            ctx.body = err.data;
            ctx.status = 200;
        } else {
            if (err.data && err.data.code > 0) {
                ctx.cookies.set('lastErrorMsg', JSON.stringify({
                    code: err.data.code,
                    message: encodeURIComponent(err.data.message)
                }));
                ctx.body = `<script>window.top.location.href="/common/error/${err.data.code}"</script>`
            } else {
                ctx.body = `<script>window.top.location.href="/common/error/${ctx.status}"</script>`
            }
        }
    }
})

export default app
