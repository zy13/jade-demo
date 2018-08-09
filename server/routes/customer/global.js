/**
 * @Author: Jet.Chan
 * @Date:   2016-12-13T14:59:15+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-06T11:19:41+08:00
 */


'use strict';

import Router from 'koa-router'
import setGlobalAccountService from '../../services/projectManagement/setGlobal'
import customerAuth from '../authController/customerAuth'

const router = Router()

router.get('/global/setAccount',customerAuth, async(ctx, next) => {
    const r = await setGlobalAccountService.getExamineeInfo(ctx.session.customer.accessToken);
    //console.log(r.data.response)
    var creatProjectPermission="c1_0",
        startProjectPermission="c1_1",
        deleteProjectPermission="c1_2",
        notifyPermission="c1_3",
        accountManagerPermission="c1_4",
        newAccountPermission="c1_5",
        reSetPasswordPermission="c1_6",
        sendNotifyPermission="c1_7",
        exportNofifyPermission="c1_8",
        removeAccountPermission="c1_9",
        accountSettingPermission="c1_10",
        dataManagerPermission="c1_11",
        exportDataDetailPermission="c1_12",
        copyPorjectPermission="c1_13";

    var permission = ctx.session.customer.permission;
    var canShowProjectView = false;//判断是否能显示项目模块

    if(permission){
        if(permission.includes(creatProjectPermission) || permission.includes(startProjectPermission)
            || permission.includes(deleteProjectPermission) || permission.includes(notifyPermission)
            || permission.includes(accountManagerPermission) || permission.includes(newAccountPermission)
            || permission.includes(reSetPasswordPermission) || permission.includes(sendNotifyPermission)
            || permission.includes(exportNofifyPermission) || permission.includes(removeAccountPermission)
            || permission.includes(accountSettingPermission) || permission.includes(dataManagerPermission)
            || permission.includes(exportDataDetailPermission)||permission.includes(copyPorjectPermission)){
            canShowProjectView = true;
        }
    }

    ctx.render('global/setAccount',{
        pageTitle: '帐号管理-帐号设定管理',
        globalInfo: r.data.response,
        canShowProjectView:canShowProjectView
    })
});

export default router;
