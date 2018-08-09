/*
 * @Author: sihui.cao
 * @Date:   2016-12-16 10:37:17
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-12T12:37:22+08:00
 */

import 'babel-polyfill'
import Router from 'koa-router'

import q from '../../util/asyncHttp'
import http from '../../util/http'
import examListServices from '../../services/examManagement/examList'
import customerAuth from '../authController/customerAuth'
const router = Router()

//创建/修改试卷第一步
let createOrEditPaper = async(ctx, next) => {
    let paperUnicode = ctx.params.paperUnicode || '';
    let mode = ctx.request.query.mode ? parseInt(ctx.request.query.mode) : 2;
    let paperId = ctx.request.query.paperId||'';
    if (paperUnicode) {
        var r = await examListServices.getEditPaperDetail(paperUnicode, ctx.session.customer.accessToken, 'create')
    }
    ctx.render('examList/createPaper', {
        pageTitle: mode == 1 ? '考试库-创建试卷':'考试库-修改试卷'  ,
        response: r && r.data ? r.data.response : {},
        paperUnicode: paperUnicode,
        mode: mode,
        paperId:paperId
    })
}
router.get('/examList/createPaper', customerAuth, createOrEditPaper)
router.get('/examList/editPaper/:paperUnicode', customerAuth, createOrEditPaper)


//创建/修改试卷第二步
router.get('/examList/setPaper/:paperUnicode', customerAuth, async(ctx, next) => {
    let paperUnicode = ctx.params.paperUnicode;
    let mode = ctx.request.query.mode ? parseInt(ctx.request.query.mode) : 2;
    let paperId = ctx.request.query.paperId||'';
    ctx.render('examList/setPaper', {
        pageTitle: '考试库-设置题目',
        paperUnicode: paperUnicode ? paperUnicode : '',
        mode: mode,
        paperId:paperId
    })
})

//创建/修改试卷第三步
router.get('/examList/setScore/:paperUnicode', customerAuth, async(ctx, next) => {
    let paperUnicode = ctx.params.paperUnicode || '';
    let paperId = ctx.request.query.paperId||'';
    let mode = ctx.request.query.mode ? parseInt(ctx.request.query.mode) : 2;
    let r = await examListServices.getPaperScoreDetail(paperUnicode, ctx.session.customer.accessToken)

    ctx.render('examList/setScore', {
        pageTitle: '考试库-设置分数',
        paperUnicode: paperUnicode,
        mode: mode,
        paperId:paperId,
        response: r && r.data && r.data.response ? r.data.response : {}
    })
})

//创建/修改试卷第四步
router.get('/examList/setPaperRemark/:paperUnicode', customerAuth, async(ctx, next) => {
    let paperUnicode = ctx.params.paperUnicode || '';
    let paperId = ctx.request.query.paperId||'';
    let mode = ctx.request.query.mode ? parseInt(ctx.request.query.mode) : 2;
    let r = await examListServices.getPaperRemarkDetail(paperUnicode, ctx.session.customer.accessToken)

    ctx.render('examList/setPaperRemark', {
        pageTitle: '考试库-设置结束语',
        mode: mode,
        paperId:paperId,
        paperUnicode: paperUnicode ? paperUnicode : '',
        response: r && r.data && r.data.response ? r.data.response : {}
    })
})

//创建/修改试卷结束
router.get('/examList/setCompletion/:paperUnicode', customerAuth, async(ctx, next) => {
    var paperUnicode = ctx.params.paperUnicode;
    let paperId = ctx.request.query.paperId||'';
    let mode = ctx.request.query.mode ? parseInt(ctx.request.query.mode) : 2;
    ctx.render('examList/setCompletion', {
        pageTitle: '考试库-设置完成',
        mode: mode,
        paperId:paperId,
        paperUnicode: paperUnicode ? paperUnicode : ''
    })
})


//试卷管理列表
router.get('/examList/list', customerAuth, async(ctx, next) => {
    let queryList = await examListServices.getPaperQueryList(ctx.request.query,
        ctx.session.customer.accessToken);
    ctx.render('examList/list', {
        pageTitle: '考试库-试卷列表',
        queryList: queryList.data.response
    })
})

//试卷预览
router.get('/examList/list/preview/:paperUnicode', customerAuth, async(ctx, next) => {
    let paperUnicode = ctx.params.paperUnicode || '';
    ctx.request.query.pageNo = ctx.request.query.pageNo=='0'?1:ctx.request.query.pageNo;
    let queryList = await examListServices.getPreviewQueryList(paperUnicode,ctx.request.query,
        ctx.session.customer.accessToken);

    //出错或者状态由完成变为修改
    if(queryList.code!=0){
        ctx.redirect('/customer/home');
        return;
    }
    ctx.render('examList/preview', {
        pageTitle: '考试库-试卷列表-预览',
        queryList: queryList.data.response,
        paperUnicode,
        noEdit: true
    })
})
export default router
