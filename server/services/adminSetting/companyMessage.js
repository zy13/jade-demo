/*
* @Author: sihui.cao
* @Date:   2016-12-06 16:05:34
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-07 10:01:19
*/

'use strict';
import companyMessageDao from "../../dao/administratorSetting/companyMessage";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const companyMessageServices = {
    async getCompanyMessage(query = {}, accessToken = '', companyId = '') {
        if (!query || !accessToken || !companyId) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken
            },
            companyId
        }

        const r = await companyMessageDao.GetCompanyMessage(opts);
        /**
        const r = {
            code: 0,
            response:{
                dCompany: {
                    id: 1,
                    industryId: 1,
                    industryName: "互联网/it管理",
                    name: "广州倍智股份有限公司"
                },
                industryList: [
                    {
                        id: 1,
                        name: "互联网/it管理"
                    },
                    {
                        id: 2,
                        name: "互联网/it管理"
                    }
                ]
            }

        }
         **/
        if (r && r.code == 0) {
            r.response.industryArr = Array.from(r.response.industryList,(v)=>{
                return {
                    value:v.id,
                    text:v.name
                }
            })
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    }
}

export default companyMessageServices
