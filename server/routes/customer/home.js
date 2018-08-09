/*
 * @Author: zyuan
 * @Date:   2016-11-24 15:27:25
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-03T15:47:44+08:00
 */

'use strict';

import Router from 'koa-router'
import customerAuth from '../authController/customerAuth'

const router = Router()

router.get('/home', customerAuth, async(ctx, next) => {
    let globalAccountSettingPermission="c0_0",
        notifyTempletePermission="c0_1",
        statisticsPermission="c0_2",
        creatProjectPermission="c1_0",
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
        copyPorjectPermission="c1_13",
        createPaperPermission="c3_0",
        copyPaperPermission="c3_1",
        exportPaperPermission="c3_2",
        deletePaperPermission="c3_3";
    let permission = ctx.session.customer.permission;
    let goToUrl = '';//iframe跳转路径
    let leftToLink =1;//默认选定项目模块
    let canShowProjectView = false;//判断是否能显示项目模块
    let canShowPaperView =false;//判断是否能显示考试库模块

    if(permission){
        //有项目查询权限
        if(permission.includes(creatProjectPermission) || permission.includes(startProjectPermission)
            || permission.includes(deleteProjectPermission) || permission.includes(notifyPermission)
            || permission.includes(accountManagerPermission) || permission.includes(newAccountPermission)
            || permission.includes(reSetPasswordPermission) || permission.includes(sendNotifyPermission)
            || permission.includes(exportNofifyPermission) || permission.includes(removeAccountPermission)
            || permission.includes(accountSettingPermission) || permission.includes(dataManagerPermission)
            || permission.includes(exportDataDetailPermission)||permission.includes(copyPorjectPermission)){
            goToUrl = '/customer/projectList/index';
        }else if(permission.includes(globalAccountSettingPermission)){//全局账号设置的权限
            goToUrl ='/customer/global/setaccount';
        }else if(permission.includes(notifyTempletePermission)){//有查看通知的权限
            goToUrl ='/customer/template/email';
        }else if(permission.includes(statisticsPermission)){//有查看统计数的权限
            goToUrl ='/customer/statistics/index';
        }
        //判断是否有考试库相关权限
        if(permission.includes(createPaperPermission) || permission.includes(copyPaperPermission)
            || permission.includes(exportPaperPermission) || permission.includes(deletePaperPermission)){
            canShowPaperView = true;//有考试库权限则显示菜单
        }
        //没有查看所有项目相关的权限
        if (goToUrl ==''){
            if(canShowPaperView){
                leftToLink =2;//没有项目模块权限则默认选定考试库模块
                goToUrl='/customer/examList/list';//没有项目相关权限，则默认显示考试库列表
            }
        }else{
            canShowProjectView = true;//有项目相关权限则显示菜单
        }
    }

    ctx.render('home/index', {
        goToUrl:goToUrl,
        leftToLink:leftToLink,
        canShowProjectView :canShowProjectView,
        canShowPaperView:canShowPaperView
    })
})

export default router
