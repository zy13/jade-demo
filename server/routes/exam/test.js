/**
 * @Author: Jet.Chan
 * @Date:   2016-11-15T13:55:29+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-20T18:39:21+08:00
 */



import 'babel-polyfill'
import Router from 'koa-router'

import q from "../../util/asyncHttp"
import http from "../../util/http"

const router = Router()

//import Ccap from 'ccap';





router.get('/api', async(ctx, next) => {
    var r = await http.post('/osnotify/mailTemplates', {
        accessToken: '123123',
        companyId: '123',
        creator: '123',
        limit: '123',
        pageIndex: '123',
        sortFields: 'des',

    })

    //const r= await http.del(`/osnotify/mailTemplate/?accessToken=${123}&id=${123}`)

    console.log('test api mock data', r);
    console.log('test api mock data end', r);
    ctx.body = {
        "asd": '123',
        "123": "asd"
    };
})
router.get('/jade', async(ctx, next) => {
    // const ccap = Ccap();
    // let ary = ccap.get();
    //
    // console.log(ary[1]);
    ctx.render('test/index', {
        title: 'jade test 1111111111111111'
    })
})

// router.get('/', async(ctx, next) => {
//     // const title = "this test /"
//     // ctx.body = title
//     //
//     // console.log(this);
//     console.log(ctx.context);
//     ctx.body = ctx.i18n.__('locales.zh-CN');
// })

router.get('/asd', async(ctx, next) => {
    console.log(q);
    var r = await q.when([http.get('www.baidu.com'), http.get('www.baidu.com')])
    console.log(r);
    ctx.body = r
})

export default router
