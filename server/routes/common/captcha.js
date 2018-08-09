 /**
  * @Author: Jet.Chan
  * @Date:   2016-12-19T15:06:27+08:00
  * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-23T17:53:27+08:00
  */

 'use strict';

 import 'babel-polyfill'
 import Router from 'koa-router'
 import userServices from '../../services/user/login'

 const router = Router()


 router.get('/captcha/getValidateCode', async(ctx, next) => {
     const r = await userServices.getValidateCode();
     ctx.session.validateCode = r.data.response.code;
     ctx.session.maxAge = 1000 * 60 * 10;

     let imgBuffer = new Buffer(r.data.response.base64Image, 'base64');
     ctx.type = 'image/jpeg';
     ctx.body = imgBuffer;
 });

 export default router;
