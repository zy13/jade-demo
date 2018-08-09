/*
 * @Author: zyuan
 * @Date:   2017-01-13 10:28:07
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-02-21T14:32:32+08:00
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';
import each from '../../util/errorCode.handler.js';
const appConfig = AppConfig || {}
const ExerciseDao = {

    //保存答案--方法名有歧义
    getPaperDetail(opts) {
        return ajaxHelper.post({
            url: `/osexamer/exercise/answer/${opts.taskId}/${opts.paperId}/${opts.seqNo}`,
            data: {
                accessToken: opts.accessToken,
                jsonStr: opts.jsonStr,
                ignoreLimit: opts.ignoreLimit || false
            }
        })
    },

    submitPaper(opts) {
        return ajaxHelper.post({
            url: `/osexamer/exercise/flush/${opts.taskId}/${opts.paperId}`,
            data: {
                accessToken: opts.accessToken
            }
        })
    },

    //上传附件
    uploadFile(elemId, opts) {
        return new Promise((r, rej) => {
            let conf = appConfig.static;
            $.ajaxFileUpload({
                url: ajaxHelper.dynamicDomain() + `/osexamer/exercise/attachment/upload/${opts.taskId}/${opts.paperId}/${opts.seqNo}?accessToken=` + opts.accessToken,
                secureuri: false,
                fileElementId: elemId,
                dataType: 'text',
                data: opts,
                type: 'post',
                success: function(result, status) {
                    if (each.validateOfflineCode(result)) {
                        setTimeout(() => {
                            r(result);
                        }, 6000)
                    } else {
                        r(result);
                    }
                },
                error: function(err) {
                    rej(err)
                },
                complete: function() {}
            })
        })
    },
    //删除附件
    deleteFile(opts) {
        return ajaxHelper.delete({
            url: `/osexamer/exercise/attachment/${opts.taskId}/${opts.paperId}/${opts.seqNo}/${opts.fileName}/${opts.suffix}?accessToken=${opts.accessToken}`,
            data: {
                accessToken: opts.accessToken,
                fileName: opts.fileName,
                suffix: opts.suffix,
                seqNo: opts.seqNo,
                paperId: opts.paperId,
                taskId: opts.taskId,
                suffix: opts.suffix
            }
        })
    },
    /**
     * 终端次数提交
     * 
     * @param {any} opts.taskId
     * @param {any} opts.paperId
     * @param {any} opts.type 0-规则；1-行为
     * @returns 
     */
    change(opts) {
        return ajaxHelper.post({
            url: `/osexamer/exercise/change/${opts.taskId}/${opts.paperId}/${opts.type}`,
            data: {
                accessToken: opts.accessToken,
            }
        })
    },

    //下载图片
    downloadImg(opts, accessToken, fileName) {
        return ajaxHelper.download(`/osexamer/exercise/attachment/download/${opts.taskId}/${opts.paperId}/${opts.seqNo}`, "get", `<input type="text" name='accessToken' value='${accessToken}' /><input type="text" name='fileName' value='${fileName}' />`);
    },

    //评卷人-下载图片
    downloadExamerImg(opts, accessToken, fileName) {
        return ajaxHelper.download(`/osexamer/exercise/attachment/download/${opts.taskId}/${opts.paperId}/${opts.examerId}/${opts.seqNo}`, "get", `<input type="text" name='accessToken' value='${accessToken}' /><input type="text" name='fileName' value='${fileName}' />`);
    }

}

export default ExerciseDao