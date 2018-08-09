/**
 * @Author: Jet.Chan
 * @Date:   2016-12-26T10:31:47+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-21T14:32:05+08:00
 */


'use strict';

import ajaxHelper from '../../util/ajaxHelper';
const appConfig = AppConfig || {}
const questionDao = {
    saveSubject(data) {
        return ajaxHelper.put({
            url: `/ospaper/question/stem/${data.paperId}`,
            data: {
                accessToken: data.accessToken,
                jsonStr: data.jsonStr,
                subject: data.subject,
                unicode: data.unicode,
                paperUnicode:data.paperUnicode
            }
        })
    },
    deleteSubject(accessToken, uniCodes) {
        return ajaxHelper.delete({
            // url: `/ospaper/question/item/del/${uniCodes}`,
            url: `/ospaper/question/item/${uniCodes}?accessToken=${accessToken}`
        })
    },
    addSubject(data) {
        return ajaxHelper.post({
            url: `/ospaper/question/stem/${data.paperId}`,
            data: {
                accessToken: data.accessToken,
                jsonStr: data.jsonStr,
                subject: data.subject
            }
        })
    },
    changeType(data) {
        return ajaxHelper.put({
            url: `/ospaper/question/stem/style/${data.unicode}`,
            data: {
                accessToken: data.accessToken,
                jsonStr: data.jsonStr,
                paperUnicode:data.paperUnicode

            }
        })
    },
    saveUnicode(accessToken, unicode, jsonStr) {
        return ajaxHelper.post({
            url: `/ospaper/question/sequence/${unicode}`,
            data: {
                accessToken,
                jsonStr
            }
        })
    },
    getQuesDetail(unicode, accessToken) {
        return ajaxHelper.get({
            url: `/ospaper/question/stems/${unicode}`,
            data: {
                accessToken,
                time:new Date().getTime()
            }
        })
    },
    importQues(elemId, data) {
        return new Promise((r, rej) => {
            let conf = appConfig.static;
            $.ajaxFileUpload({
                url: ajaxHelper.dynamicDomain() + `/ospaper/question/paper/import/${data.paperUnicode}?accessToken=${data.accessToken}`,
                secureuri: false,
                fileElementId: elemId,
                dataType: 'text',
                data: data,
                type: 'post',
                success: function(result, status) {
                    r(result)
                },
                error: function(err) {
                    console.log(err)
                    rej(err)
                },
                complete: function() {

                }
            })
        })
    }


}
export default questionDao;
