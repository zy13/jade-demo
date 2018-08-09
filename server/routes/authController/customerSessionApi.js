/**
 * @Author: Jet.Chan
 * @Date:   2016-12-05T14:25:48+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-22T15:10:24+08:00
 */

import Router from 'koa-router';
import CommonResult from "../../util/commonResult";
import userServices from '../../services/user/login'
import moment from 'moment';

const cr = new CommonResult();
const router = Router();

router.get('/session/getContext', async(ctx) => {
    if (ctx.session.customer) {
        ctx.body = cr.successData(ctx.session.customer);
    } else {
        ctx.body = cr.errorData({}, '用户登录超时', 999);
    }
})

router.post('/session/login', async(ctx) => {
    console.log(122, ctx.session)
    ctx.session = {}
    if (true) {

        // let validateCode = ctx.request.body.validateCode || '';

        // if (ctx.session.isRequiredValidateCode) {
        //     let isValidate = ctx.session.validateCode && validateCode.toUpperCase() == ctx.session.validateCode.toUpperCase();
        //     if (!isValidate) {
        //         ctx.body = {
        //             status: true,
        //             isValidate: false,
        //             message: '验证码错误！'
        //         }
        //         return;
        //     }
        // }


        let query = {};

        // query.callerIP = ctx.callerIP; //来源IP
        // query.callerFrom = '0'; //来源（0：web,1:app）
        // query.loginType = '1'; //登录类型: 0代表考生，1代表管理员
        // query.account = ctx.request.body.account;
        // query.password = ctx.request.body.password;
        // query.validateCode = ctx.request.body.validateCode;

        // const r = await userServices.userWebLogin(query);
        if (true) {
            ctx.session.customer = {}
            ctx.session.customer.permission = '12312';
            ctx.session.customer.accessToken = '123412412412';
            ctx.session.customer.account = '23412';
            ctx.session.customer.companyId = '4564';
            ctx.session.customer.name = 'admin';
            ctx.session.customer.tips = '';
            ctx.session.customer.userId = '234234';
            ctx.session.customer.ExpiresTime = moment().add(1000 * 60 * 120, 'ms').format();
            ctx.session.maxAge = 1000 * 60 * 120;
            ctx.session.isRequiredValidateCode = false;


            ctx.body = {
                status: true,
                isValidate: true,
                customer: ctx.session.customer,
                message: r.message
            }
        } else {
            let res = {
                status: false,
                isValidate: true,
                message: r.message || '服务器繁忙，请稍后重试',
                code: r.code
            };
            if (r && (r.code == 27003001 || r.code == 27003003)) {
                ctx.session.isRequiredValidateCode = true;
                res.isRequiredValidateCode = true;
            }
            ctx.body = res
        }
    } else {
        ctx.body = {
            status: false,
            message: '网络错误！'
        }
    }
})

router.post('/session/update', async(ctx) => {
    let postData = ctx.request.body;
    let newName = postData.name;

    if (ctx.session || ctx.session.customer || postData.accessToken == ctx.session.customer.accessToken) {
        ctx.session.customer.read = postData.read;
        if(typeof newName == 'string')
            ctx.session.customer.name = newName && newName.length>0? newName : ctx.session.customer.account;
        ctx.body = {
            status: true,
            message: 'update success'
        }
    } else {
        ctx.body = {
            status: false,
            message: 'update fail'
        }
    }
})

router.post('/session/logout', async(ctx) => {
    var postData = ctx.request.body;
    if (ctx.session || ctx.session.customer || postData.accessToken == ctx.session.customer.accessToken) {
        ctx.session = null;
        ctx.body = {
            status: true,
            message: 'logout success'
        }
    } else {
        ctx.body = {
            status: false,
            message: 'logout fail'
        }
    }
});


export default router
