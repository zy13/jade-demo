/*
* @Author: sihui.cao
* @Date:   2016-12-02 19:11:28
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-06 20:13:55
*/

'use strict';

import aj from '../../util/ajaxHelper';

const TemplateDao = {

    /**
     * 新建邮件模板
     * @param  {accessToken}    用户token string
     * @param  {content}        模板内容 string
     * @param  {name}           模板名称 string
     * @param  {sign}           邮件签名 string
     * @param  {subject}        邮件主题 string
     * @param  {whetherDefault} 是否默认 number
     */
    addMailTemplate(data){
        return aj.post({
            url: '/osproject/mailTemplate?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                content: data.content|| '',
                name: data.name|| '',
                sign: data.sign|| '',
                subject: data.subject|| '',
                whetherDefault: data.whetherDefault|| 0
            }
        })
    },

    /**
     * 修改邮件模板
     * @param  {accessToken}    用户token string
     * @param  {content}        模板内容 string
     * @param  {id}             模板编号 number
     * @param  {name}           模板名称 string
     * @param  {sign}           邮件签名 string
     * @param  {subject}        邮件主题 string
     * @param  {whetherDefault} 是否默认 number
     */
    editMailTemplate(data){
        return aj.put({
            url: '/osproject/mailTemplate?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                content: data.content|| '',
                id: data.id || '',
                name: data.name|| '',
                sign: data.sign|| '',
                subject: data.subject|| '',
                whetherDefault: data.whetherDefault|| 0
            }
        })

    },

    /**
     * 修改邮件模板状态
     * @param  {accessToken} 用户token string
     * @param  {status}      状态  boolean
     */
    mailTemplateStatus(data){
        return aj.put({
            url: '/osproject/mailTemplate/status/'+ data.id +'?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                status: data.status
            }
        })
    },

    /**
     * 删除邮件模板
     * @param  {accessToken} 用户token   string
     * @param  {id}      模板id          string
     */
    deleteMailTemplate(data){
        return aj.post({
            url: '/osproject/mailTemplate/del',
            data: {
                accessToken: data.accessToken || '',
                id: data.id
            }
        })

    },

    /**
     * 检验邮件模板名称
     * @param  {accessToken} 用户token   string
     * @param  {companyId}   公司编号    string
     * @param  {name}        模板名称    string
     * @param  {id}          模板id      string
     */
    checkMailTemplateName(data){
        return aj.post({
            url: '/osproject/mailTemplate/check?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                name: data.name || '',
                id: data.id
            }
        })
    },


    /**
     * 新建短信模板
     * @param  {accessToken}    用户token string
     * @param  {content}        模板内容 string
     * @param  {name}           模板名称 string
     * @param  {whetherDefault} 是否默认 number
     */
    addMesTemplate(data){
        return aj.post({
            url: '/osproject/smsTemplate?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                content: data.content|| '',
                name: data.name|| '',
                whetherDefault: data.whetherDefault|| 0
            }
        })
    },

    /**
     * 修改短信模板
     * @param  {accessToken}    用户token string
     * @param  {content}        模板内容 string
     * @param  {id}             模板编号 number
     * @param  {name}           模板名称 string
     * @param  {whetherDefault} 是否默认 number
     */
    editMesTemplate(data){
        return aj.put({
            url: '/osproject/smsTemplate?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                content: data.content|| '',
                id: data.id || '',
                name: data.name|| '',
                whetherDefault: data.whetherDefault|| 0
            }
        })
    },

    /**
     * 修改短信模板状态
     * @param  {accessToken} 用户token string
     * @param  {status}      状态  boolean
     */
    mesTemplateStatus(data){
        return aj.put({
            url: '/osproject/smsTemplate/status/'+ data.id +'?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                status: data.status
            }
        })
    },

    /**
     * 删除短信模板
     * @param  {accessToken} 用户token   string
     * @param  {id}      模板id          string
     */
    deleteMesTemplate(data){
        return aj.post({
            url: '/osproject/smsTemplate/del',
            data: {
                accessToken: data.accessToken || '',
                id: data.id
            }
        })
    },


    /**
     * 检验短信模板名称
     * @param  {accessToken} 用户token   string
     * @param  {companyId}   公司编号    string
     * @param  {name}        模板名称    string
     * @param  {id}          模板id      string
     */
    checkMesTemplateName(data){
        return aj.post({
            url: '/osproject/smsTemplate/check?time='+new Date().getTime(),
            data: {
                accessToken: data.accessToken || '',
                name: data.name || '',
                id: data.id
            }
        })
    },

    //获取发送通知数据-评卷人
    getSendInformExaminer(data){
        return aj.get({
            url:'/osproject/notify/toSend/examiner/'+data.taskId +'?accessToken='+data.accessToken
        })
    },

    //获取发送通知数据-考生
    getSendInformExaminee(data){
        return aj.post({
            url:'/osproject/notify/toSend/examinee',
            data:data
        })
    },

    //发送通知-评卷人
    sendInformToExaminer(data){
        // console.log("data:" + data.sendType);
        return aj.post({
            url:'/osproject/notify/send/examiner',
            data:{
                accessToken: data.accessToken || '',
                ids: data.ids || '',
                sendType:data.sendType,
                projectId: data.projectId || '',
                projectIds: data.projectIds || '',
                projectName: data.projectName || '',
                taskId: data.taskId || '',
                taskIds: data.taskIds || '',
                taskName: data.taskName || '',
                sendSubject: data.sendSubject || '',
                emailContent: data.emailContent || '',
                sign: data.sign || '',
                newMailName: data.newMailName || '',
                newSmsName: data.newSmsName || '',
                smsContent: data.smsContent || '',
                whetherDefaultMail: data.whetherDefaultMail,
                whetherDefaultSms: data.whetherDefaultSms,
                whetherSaveMail: data.whetherSaveMail,
                whetherSaveSms: data.whetherSaveSms,
            }
        })
    },

    //预览-评卷人
    previewInformExaminer(data){
        return aj.post({
            url:'/osproject/notify/preview/examiner',
            data:{
                accessToken:data.accessToken || '',
                ids:data.ids || '',
                emailContent:data.emailContent || '',
                pageIndex:data.pageIndex || '',
                sign:data.sign || '',
                smsContent:data.smsContent || '',
                subject:data.subject || '',
                taskId:data.taskId || '',
                taskIds:data.taskId || ''
            }
        })
    },

    //预览-考生
    previewInformExaminee(data){
        return aj.post({
            url:'/osproject/notify/preview/examinee',
            data:{
                accessToken:data.accessToken || '',
                ids:data.ids || '',
                emailContent:data.emailContent || '',
                pageIndex:data.pageIndex || '',
                sign:data.sign || '',
                smsContent:data.smsContent || '',
                subject:data.subject || '',
                taskId:data.taskId || '',
                taskIds:data.taskId || '',
                taskName:data.taskName || '',
                projectId:data.projectId || '',
                projectIds:data.projectId || '',
                projectName:data.projectName || '',
                cmctStatus:data.cmctStatus,
                cmctWay:data.cmctWay,
                key1Begin:data.key1Begin,
                key1End:data.key1End,
                key2:data.key2,
                searchType1:data.searchType1,
                searchType2:data.searchType2,
                status:data.status,
                sendType:data.sendType
            }
        })
    },

    //发送通知-考生
    sendInformToExaminee(data){
        return aj.post({
            url:'/osproject/notify/send/examinee',
            data:data
        })
    },
}

export default TemplateDao
