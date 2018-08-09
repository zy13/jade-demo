/**
 * @Author: Jet.Chan
 * @Date:   2016-11-11T12:02:50+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-13T16:22:28+08:00
 */

import convert from 'koa-convert'
import baseRouter from "../util/baseRouter"

//******************exam router******************************
import test from './exam/test.js'
import examUser from './exam/user.js'
import examTaskList from './exam/taskList.js'
import examPaper from './exam/paper.js'

//******************customer router******************************

//******************customer router******************************
import user from './customer/user'
import home from './customer/home'
import template from './customer/template'
import admin from './customer/admin.js'
import projectList from './customer/projectList.js'
import global from './customer/global.js'
import examineeInfo from './customer/examineeInfo.js'
import examList from './customer/examList.js'
import examiner from './customer/examiner.js'
import statistics from './customer/statistics.js'
//session api
import customerSessionApi from './authController/customerSessionApi'
import examSessionApi from './authController/examSessionApi'
//******************customer end******************************

//******************exam fe router****************************
//******************exam fe end*******************************

//******************common 公用模块路由  router****************************
import captcha from './common/captcha.js'
import error from './common/error.js'
//******************common  end*******************************

export default (app) => {

    //测聘前端  /exam
    const examRouter = baseRouter({
        prefix: '/exam'
    })
    examRouter.use(examSessionApi.routes(),examSessionApi.allowedMethods())
    // examRouter.use(test.routes(), test.allowedMethods())
    examRouter.use(examUser.routes(), examUser.allowedMethods())
    examRouter.use(examTaskList.routes(), examTaskList.allowedMethods())
    examRouter.use(examPaper.routes(), examPaper.allowedMethods())

    //企业后台  /customer
    const customerRouter = baseRouter({
        prefix: '/customer'
    })
    customerRouter.use(customerSessionApi.routes(),customerSessionApi.allowedMethods())
    customerRouter.use(admin.routes(), admin.allowedMethods())
    customerRouter.use(template.routes(), template.allowedMethods())
    customerRouter.use(projectList.routes(), projectList.allowedMethods())
    customerRouter.use(global.routes(), global.allowedMethods())
    customerRouter.use(examineeInfo.routes(), examineeInfo.allowedMethods())
    customerRouter.use(home.routes(), home.allowedMethods())
    customerRouter.use(user.routes(), user.allowedMethods())
    customerRouter.use(examList.routes(), examList.allowedMethods())
    customerRouter.use(examiner.routes(), examiner.allowedMethods())
    customerRouter.use(statistics.routes(), statistics.allowedMethods())


    //公用模块 /common
    const commonRouter = baseRouter({
        prefix: '/common'
    })
    commonRouter.use(captcha.routes(),captcha.allowedMethods())
    commonRouter.use(error.routes(),error.allowedMethods())

    // --  总入口
    app.use(examRouter.routes(), examRouter.allowedMethods())
    app.use(customerRouter.routes(), customerRouter.allowedMethods())
    app.use(commonRouter.routes(), commonRouter.allowedMethods())

}
