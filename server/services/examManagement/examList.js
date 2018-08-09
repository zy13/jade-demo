/*
 * @Author: sihui.cao
 * @Date:   2016-12-16 14:11:44
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-27T11:43:32+08:00
 */

import examListDao from "../../dao/examManagement/examList";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const examListServices = {
    async getEditPaperDetail(paperUnicode = '', accessToken = '') {
        if (!paperUnicode || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                paperUnicode,
                accessToken
            }
        }

        const r = await examListDao.getPaperDetail(paperUnicode, accessToken);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }

        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    async getQuesDetail(paperUnicode = '', accessToken = '') {
        if (!paperUnicode || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                paperUnicode,
                accessToken
            }
        }

        const r = await examListDao.getQuesDetail(paperUnicode, accessToken);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }

        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },


    async getPaperScoreDetail(paperUnicode = '',accessToken = '') {
        if (!paperUnicode || !accessToken) {
            return cr.errorData('参数错误');
        }

        const opts = {
            param: {
                paperUnicode,
                accessToken
            }
        }

        const r = await examListDao.getScore(paperUnicode,accessToken);
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }

        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },


    async getPaperRemarkDetail(paperUnicode = '',accessToken = '') {
        if (!paperUnicode || !accessToken) {
            return cr.errorData('参数错误');
        }

        const opts = {
            param: {
                paperUnicode,
                accessToken
            }
        }

        const r = await examListDao.getRemark(paperUnicode,accessToken);
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }

        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    async getPaperQueryList(query = {}, accessToken = '') {
        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param:{
                accessToken,
                key1Begin: query.key1Begin || '',
                key1End: query.key1End || '',
                key2: query.key2 || '',
                searchType1: query.searchType1 || '',
                searchType2: query.searchType2 || '',
                limit: query.pagesize || 10,
                pageIndex: query.p || query.pageIndex || 1,
                score: query.score,
                status: query.status || ''
            }
        }
        const r = await examListDao.getPaperQueryList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },


    async getPaperRemark(query = {}, accessToken = '') {

        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param:{
                paperUnicode: query.paperUnicode,
                accessToken,
                pageNo: query.pageNo || 0
            }
        }
        const r = await examListDao.getPreviewQueryList(opts);


        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },


    //预览
    async getPreviewQueryList(paperUnicode = '',query = {}, accessToken = '') {

        if (!paperUnicode || !query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param:{
                accessToken,
                pageNo: query.pageNo || 1,
                viewSrc: query.viewSrc || '',
                paperUnicode
            }
        }
        const r = await examListDao.getPreviewQueryList(opts);


        if (r) {
            if(r.code == 0){
                if(r.response&&r.response.pageList)
                    r.response.pageList = JSON.stringify(r.response.pageList)
                opts.response = r.response
                return cr.successData(opts)
            }else if(r.code == 28007003){
                return cr.errorData(opts, '当前试卷正在被创建人修改中，暂时无法进行此操作',28007003);
            }

        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default examListServices
