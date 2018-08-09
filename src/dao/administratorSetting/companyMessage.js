/*
* @Author: sihui.cao
* @Date:   2016-12-06 16:46:17
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-21T14:31:31+08:00
*/

'use strict';
import aj from '../../util/ajaxHelper';
const appConfig = AppConfig || {}
const CompanyMessageDao = {

    /**
     * 修改企业信息
     * @param  {accessToken}    用户token string
     * @param  {companyName}    公司名称 string
     * @param  {file}           上传logo图片文件,上传logo图片格式为:jif,bmp,jpg,jpeg,tif,png string
     * @param  {industryId}     行业id string
     * @param  {industryName}   行业名称 string
     */

    editCompanyMessage(elemId,data){
        return new Promise((r,rej)=>{
            $.ajaxFileUpload({
                url: aj.dynamicDomain() + '/osadmin/company/upload?accessToken='+data.accessToken,
                secureuri:false,
                fileElementId:elemId,
                dataType:'text',
                data:data,
                type:'post',
                success:function(result,status){
                    r(result)
                },
                error:function(err){
                    console.log(err)
                    rej(err)
                },
                complete:function(){

                }
            })
        })
    }


}

export default CompanyMessageDao
