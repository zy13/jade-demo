/*
 * @Author: sihui.cao
 * @Date:   2016-12-09 11:35:44
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T10:26:28+08:00
 */

'use strict';

import cui from 'c-ui'
// import dalExam from '../../dao/examManagement/paper'
import dalProject from '../../dao/projectManagement/projectList'
import SuccessTip from '../../components/tips/successTip'
import session from '../../dao/sessionContext'
import EditPaper from './mod/selectPaper'
import moment from 'moment'
import _ from 'lodash'
import loading from '../../components/loading/index'
import * as tools from '../../components/share/tools'
import hfCommon from '../../components/share/hfCommon'
import './selectPaper.less'
import '../../components/commonTab/style.less'
//页面级
class SelectPaper {
    constructor() {
        this.checkBoxes = Array.from($('.storage ul .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.savePaper = {
            length: 0
        }
        this.projectId = $('#projectId').val()
        // if(tools.pageHelper.urlContext()['startDate']){
        //     let date = tools.pageHelper.urlContext()['startDate'].replace('%20',' ')
        //     this.projectStartDateL = moment(date).valueOf()
        // }
        // if(tools.pageHelper.urlContext()['endDate']){
        //     let date = tools.pageHelper.urlContext()['endDate'].replace('%20',' ')
        //     this.projectEndDateL = moment(date).valueOf()
        // }

        this.getContext()
        this.initPaper()
        this.watch()
    }

    getContext() {
        var self = this;
        session.customer().then((res) => {
            self.context = res;
            this.localRefresh()
        }, (err) => {
            this.localRefresh()
        })
    }

    initPaper(){
        var self = this
        loading.open()
        session.customer().then((r)=>{
            return dalProject.getSelectedPaperList(this.projectId, r.accessToken)
        }).then((res)=>{
            loading.close()
            if(res.code!=0){
                cui.popTips.error(res.message)
                return;
            }
            self.projectStartDateL = res.response.projectStartDateL?parseInt(res.response.projectStartDateL):null
            self.projectEndDateL = res.response.projectEndDateL?parseInt(res.response.projectEndDateL):null
            for(let v of res.response.tasks){
                let flag = false;
                v.projectStartDateL = self.projectStartDateL
                v.projectEndDateL = self.projectEndDateL
                v.sysTimeL = res.response.sysTimeL?parseInt(res.response.sysTimeL):0
                v.startDateL = v.startDateL?parseInt(v.startDateL):v.startDateL
                v.pageChangeLimit = (v.pageChangeLimit || v.pageChangeLimit == 0 )?parseInt(v.pageChangeLimit):''

                v.startDate = v.startDateL//这两个属性是用来放在按考试时长的
                v.latestStartDate = v.latestStartDateL ? parseInt(v.latestStartDateL):v.latestStartDateL//

                // v.latestStartDateL = v.examTime ? '' : ((parseInt(v.latestStartDateL)-parseInt(v.startDateL) != 0) ? Math.ceil((parseInt(v.latestStartDateL)-parseInt(v.startDateL))/1000/60) : '')
                v.latestStartDateL = v.examTime ? '' : (v.latestStartDate == v.endDateL ? '' : ((parseInt(v.latestStartDateL)-parseInt(v.startDateL) != 0) ? Math.ceil((parseInt(v.latestStartDateL)-parseInt(v.startDateL))/1000/60) : ''))


                for(let k of self.checkBoxes){
                    if(k.$el.data('id') == v.paperId){
                        flag = k.val = k.$el.find('input')[0].checked = true;
                        self.addPaper(v.paperId,k,v)
                    }
                }
                if(!flag)
                    self.addPaper(v.paperId,null,v)
            }
            this.adjustFooter()
        }).catch((err)=>{
            loading.close()
        })
    }

    //删除试卷
    removePaper(paperId,$elem) {
        //删除试卷
        new SuccessTip('删除成功！',()=>{$elem.remove();},false,1000)
        //清除checkbox状态
        let inCurPage = false;   //删除的试卷属于当前页
        for (var v of this.checkBoxes) {
            if (v.$el.data('id') == paperId) {
                //设置状态
                inCurPage = true;
                v.val = false;
                v.$el.find('input')[0].checked = false;
                v.$el.find('input').removeAttr('disabled')
                    .next('label').removeClass('readOnly');
                break;
            }
        }
        if(inCurPage){
            //清除全选
            this.checkBoxes[0].val = false;
            this.checkBoxes[0].$el.find('input')[0].checked = false;
            this.checkBoxes[0].$el.find('input').removeAttr('disabled')
                .next('label').removeClass('readOnly');
        }


        //清除全局savePaper
        delete this.savePaper[paperId]
        if (this.savePaper.length == 0) {
            $('.chosen').removeClass('active')
        }

        this.adjustFooter()
    }

    requestDelete(data){
        var self = this;
        dalProject.deleteTask({
            taskId:data.taskId,
            accessToken:self.context?self.context.accessToken:''
        }).then((res)=>{
            if(res.code == 0){
                self.savePaper.length--;
                self.removePaper(data.paperId,data.$elem)
            }else{
                cui.popTips.error(res.message)
            }
        })
    }

    //添加试卷
    addPaper(paperId,v,_data={}) {
        let self = this

        const data = _.extend({
                time: parseInt(new Date().getTime()),
                name: v?v.$el.parent().next().text():'',
                finishType: "1",
                examType: 'examType' + new Date().getTime(),
                move:'auto',
                projectStartDateL:self.projectStartDateL?self.projectStartDateL:null,
                projectEndDateL:self.projectEndDateL?self.projectEndDateL:null,
                projectEndDate:self.projectEndDateL?self.projectEndDateL:null
            },_data)

        //实例化
        self.savePaper[paperId] = new EditPaper({
                obj: $('.chosen .chosen-list'),
                paperId: paperId,
                accessToken: self.context?self.context.accessToken:'',
                data: data
            })
            //监听删除
        self.savePaper[paperId].on('delete', (data) => {
            if(data.taskId){
                this.requestDelete(data);
            }else{
                self.savePaper.length--;
                self.removePaper(data.paperId,data.$elem)
            }
        })
            //计算
        self.savePaper.length++;

        //样式
        if(v)
            v.$el.find('input').attr('disabled', 'disabled')
                .next('label').addClass('readOnly');
        if(!$('.chosen').hasClass('active'))
            $('.chosen').addClass('active')
        this.adjustFooter()
    }

    //调整footer
    adjustFooter() {
        let hgs = $('.ex-content-right').height(),
            winHei = $(window.parent.document).find('#ex-content').height();
        if (hgs <= winHei) {
            $('#ex-footer').addClass('fixed');
        } else {
            $('#ex-footer').removeClass('fixed');
        }
    }

    //单个
    singleBox(v) {
        var self = this;
        var paperId = v.$el.data('id');
        if (v.$el.find('input').is(':checked') && !self.savePaper[paperId]) {
            //增加
            //console.log('add');
            self.addPaper(paperId,v)
        }
    }

    //批量checkbox
    multiBox(v) {
        var self = this;
        v.$el.find('input').attr('disabled', 'disabled')
            .next('label').addClass('readOnly');
        for (var [i, v] of self.checkBoxes.entries()) {
            if (i == 0 || v.getValue())
                continue;
            v.val = true;
            v.$el.find('input')[0].checked = true;
            self.singleBox(v)
        }
    }

    handleCheckboxEvent(i,v){
        let self = this;
        if (i == 0) {
            self.multiBox(v)
        } else {
            self.singleBox(v)
                //全选
            if ($('.storage ul .cui-checkboxContainer input[type=checkbox]:checked').length == (self.checkBoxes.length - 1)) {
                self.checkBoxes[0].$el.find('input').trigger('click')
            } else {
                self.checkBoxes[0].val = false;
                self.checkBoxes[0].$el.find('input')[0].checked = false;
                self.checkBoxes[0].$el.find('input').removeAttr('disabled')
                    .next('label').removeClass('readOnly');
            }
        }
    }
    watch() {
        var self = this;
        for (let [i, v] of self.checkBoxes.entries()) {
            v.$el.on('change', 'input', () => {
                self.handleCheckboxEvent(i,v)
            })
        }

        $('.create-action').on('click','.next',()=>{
            var data = [],_index = -1;
            for(var i in this.savePaper){
                if(i!=='length'){
                    if(this.savePaper[i].verity())
                        data.push(this.savePaper[i].getValue())
                    else{
                        _index = i;
                    }
                }
            }
            if(_index!=-1){
                $("html,body").animate({
                    scrollTop:this.savePaper[_index].$elem.position().top
                }, 1000);
                return;
            }
            dalProject.saveSelectedPaperList(this.projectId,this.context.accessToken,JSON.stringify(data))
            .then((res)=>{
                if(res.code == 0){
                    new SuccessTip('保存成功',()=>{
                        var createOredit = $('#createOredit').val()
                        location.href="/customer/projectList/createFinish/" + this.projectId + (createOredit == 'create' ? '?createOredit=create' : '')
                    })
                }else{
                    cui.popTips.error(res.message)
                }
            },(err)=>{
                cui.popTips.error('请求失败')
            })

        })
    }

    refreshCheckbox() {
        let self = this,count=0;
        this.checkBoxes = Array.from($('.storage ul .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        for(let v of this.checkBoxes){
            let id = v.$el.data('id')
            if(this.savePaper[id]){
                count++;
                v.$el.find('input').trigger('click').attr('disabled',"disabled").next().addClass('readOnly')
            }
        }
        if(count<(this.checkBoxes.length-1)){
            this.checkBoxes[0].$el.find('input').removeAttr('disabled')
                .next('label').removeClass('readOnly');
        }else{
            this.checkBoxes[0].$el.find('input').attr('disabled','disabled')
                .next('label').addClass('readOnly');
            this.checkBoxes[0].$el.find('input')[0].checked = true;
        }
        for (let [i, v] of self.checkBoxes.entries()) {
            v.$el.on('change', 'input', () => {
                self.handleCheckboxEvent(i,v)
            })
        }
    }

    refreshList(data) {
        var html = $('.storage ul li:eq(0)')[0].outerHTML;
        for (var [i, v] of data.results.entries()) {
            html += '<li>' +
                '<div>' +
                    '<div class="cui-checkboxContainer inline" data-id="' + v.id + '">' +
                        '<input type="checkbox">' +
                        '<label><i></i><span></span></label>' +
                    '</div>' +
                '</div>' +
                '<div>' + v.name + '</div>' +
                '<div>' + v.totalNum + '</div>' +
                '<div>' + v.score + '</div>' +
                '<div>' + (v.duration == null ? '' : v.duration) + '</div>' +
                '<div>' + v.usage + '</div>' +
                '<div>' + v.creator + '</div>' +
                '<div>' + moment(v.createdDate).format('YYYY-MM-DD HH:mm:ss') + '</div>' +
                '<div>' + (v.status ? '启用': '禁用')+ '</div></li>'
            $('.storage ul').html(html)
        }

        this.refreshCheckbox()
    }

    //局部刷新--分页
    localRefresh() {
        var self = this;
        hfCommon.pagination.on('refresh', (data) => {
            this.refreshList(data)
        })
        hfCommon.pagination.localRefresh({
            url: dalProject.getPaperList,
            data: {
                accessToken: self.context && self.context.accessToken ? self.context.accessToken : '',
                projectId : this.projectId
            }
        })
    }
}

new SelectPaper()
