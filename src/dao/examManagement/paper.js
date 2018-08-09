/*
* @Author: sihui.cao
* @Date:   2016-12-12 14:10:47
* @Last Modified by:   zyuan
* @Last Modified time: 2017-02-20 11:45:58
*/

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const ExamDao = {

    //试卷列表
    getPaperList(opts) {
        return ajaxHelper.post({
            url: `/question/papers/`,
            data: {
                limit:opts.limit,
                pageIndex:opts.pageIndex ,
                accessToken: opts.accessToken
            }
        })
    }

}

export default ExamDao
