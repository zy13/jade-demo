/*
* @Author: sihui.cao
* @Date:   2016-12-09 15:48:08
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-07T10:33:11+08:00
*/

'use strict';
import juicer from 'juicer'
import cui from 'c-ui'
import WarnTip from '../../../components/tips/warnTip'
import SelectAccount from '../../../components/selectAccount/index'
import dalAdmin from '../../../dao/administratorSetting/admin'
import _ from 'lodash'
import moment from 'moment'
//已选试卷component
class EditPaper{
    constructor(setting){
        this.config = _.extend({},setting);
        this.config.data.hadStart = false;
        this.init()
        this.watch()
    }
    init(){     //生成结构
        var self = this;

        if(this.config.data.projectStartDateL&&this.config.data.startDateL){
            this.config.data.projectStartDateL = moment(parseInt(this.config.data.projectStartDateL)).format('YYYY-MM-DD HH:mm:ss')

        }
        if(this.config.data.startDateL&&this.config.data.sysTimeL>=this.config.data.startDateL){  //判断考试是否已开始
            this.config.data.hadStart = true;
        }
        if(this.config.data.projectEndDateL)
            this.config.data.projectEndDateL = moment(parseInt(this.config.data.projectEndDateL)).format('YYYY-MM-DD HH:mm:ss')

        this.config.data.startDateL = this.config.data.startDateL?moment(parseInt(self.config.data.startDateL)).format('YYYY-MM-DD HH:mm:ss'):''
        this.config.data.endDateL = this.config.data.endDateL?moment(parseInt(self.config.data.endDateL)).format('YYYY-MM-DD HH:mm:ss'):''

        this.config.data.startDate = this.config.data.startDate?moment(parseInt(self.config.data.startDate)).format('YYYY-MM-DD HH:mm:ss'):''
        this.config.data.latestStartDate = this.config.data.latestStartDate?moment(parseInt(self.config.data.latestStartDate)).format('YYYY-MM-DD HH:mm:ss'):''

        let tpljuicer = juicer(require('../tpl/selectPaper.html'));
        let $html= $(tpljuicer.render(this.config.data));

        $html.appendTo(this.config.obj)
        this.$elem = $html

        if(this.config.data.move=='auto')
            this.move()
        this.textBoxes = Array.from($html.find('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.radioGroup = Array.from($html.find('.cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)))
        this.initSelect()
        // console.log(this.config.data)

    }
    initSelect() {
        this.selectArr = Array.from(this.$elem.find('.master .account'), (v) => {
            return {
                id: $(v).data('id').replace(/&quot;/g,"\""),
                name: $(v).data('name').replace(/&quot;/g,"\"")
            }
        })
    }
    move(){
        let self = this;

        $('html,body').animate({
            scrollTop:self.$elem.position().top
        },0)

    }
    getSelect() {
        var str = ''
        var strArr = []
        var arr = this.selectAccount ? this.selectAccount.getValue() : this.selectArr;
        for (var v of arr) {
            str += v.id + ','
            strArr[strArr.length] = v.id
        }
        return strArr;
    }
    getValue(){           //获取数据
        var self = this;
        return {
            id:self.config.data.id || undefined,
            name:self.config.data.name,
            paperId:self.config.paperId,
            finishType:self.radioGroup[0].getValue(),
            startDateStr:self.radioGroup[0].getValue()=='1'? $('#'+self.config.data.time+' .startDateL').val():$('#startDate'+self.config.data.time).val(),
            endDateStr:self.radioGroup[0].getValue()=='1'? $('#'+self.config.data.time+' .endDateL').val():undefined,
            latestStartDateStr:self.radioGroup[0].getValue()=='1'? undefined:$('#latestStartDate'+self.config.data.time).val(),
            delayLimitTime:self.textBoxes[0].getValue() || undefined,
            examTime:self.textBoxes[1].getValue() || undefined,
            pageChangeLimit:self.textBoxes[2].getValue() || undefined,
            examinersArr:this.getSelect()
        }
    }
    watch(){
        var self = this;
        self.$elem.on('click','.item-del',(e)=>{     //删除试卷
            // self.$elem.remove()
            self.emit('delete',{
                taskId:$(e.currentTarget).data('id'),
                paperId:self.config.paperId,
                $elem: self.$elem
            })
        }).on('click','.cui-radioContainer',()=>{         //切换试卷类型
            setTimeout(function(){
                if(self.radioGroup[0].getValue() == 2){
                    self.$elem.find('.item-part:eq(3)').removeClass('hidden');
                    self.$elem.find('.item-part:eq(1)').addClass('hidden');
                }else{
                    self.$elem.find('.item-part:eq(1)').removeClass('hidden');
                    self.$elem.find('.item-part:eq(3)').addClass('hidden');
                }
            },10)
        }).on('click','.selectAccount',()=>{               //选择评卷人
            if(!self.selectAccount){
                dalAdmin.getExaminerList(self.config.accessToken).then((res)=>{
                    if(res.code!=0){
                        cui.popTips.error('请求失败');
                        return;
                    }
                    let select = self.config.data.examiners ? [] : res.response
                    if(self.config.data.examiners){
                        for(let v of  res.response){
                            let include = false;
                            for(let d of self.config.data.examiners){
                                if(d.account == v.account){
                                    include = true;
                                }
                            }
                            if(!include){
                                select[select.length] = v;
                            }
                        }

                    }

                    self.selectAccount = new SelectAccount({
                        title:'选择评卷人',
                        data:{
                            id:self.config.data.time,
                            select:select,
                            selected:self.config.data.examiners
                        }
                    })
                    self.selectAccount.on('sure',()=>{         //监听选择结束触发关闭弹出层
                        let $html;
                        self.$elem.find('.master .account').remove()

                        for(let v of self.selectAccount.getValue()){
                            // self.examinerStr += v.id+',';
                            $html = $('<a class="account cui-button c-preset-green" data-id="" data-name="" >'+
                                                      '<span></span><i class="cui-icon cpf-icon-thin-close"></i></a>');
                            $html.prependTo(self.$elem.find('.master'))
                            $html.data('id',v.id.replace(/\"/g,"&quot;")).data('name',v.name.replace(/\"/g,"&quot;"))
                            $html.find('span').text(v.name)
                        }
                    })
                },(err)=>{
                    cui.popTips.error('查询失败')
                })

            }else{
                self.selectAccount.open()
            }
        }).on('click','.startDate',(e)=>{
            $(e.target).removeClass('failure')
            let config = {
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                isShowClear:false
            }
            if($(e.target).hasClass('startDateL')){       //按统一时点交卷--开考时间
                config.el = `startDateL${self.config.data.time}`;
                // config.maxDate = '#F{$dp.$D(\''+`endDateL${self.config.data.time}`+'\')}';
                config.onpicked = ()=>{
                    if(!self.limitTime().judge($(e.target).val(),$(e.target).parents('.right').find('.endDate').val())){
                        new WarnTip($(e.target).parent(),'开始时间不能大于结束时间',{left:0,top:'40px'})
                        $(e.target).val($(e.target).data('value') || '')
                    }else if(self.limitTime().delay()){             //选择时间后判断是否符合规则
                        new WarnTip($(e.target).parent(),'最晚开考时间不能超过考试截止时间',{left:0,top:'40px'})
                        $(e.target).val($(e.target).data('value') || '')
                    }else
                        $(e.target).data('value',$(e.target).val())
                }
            }else{                                        //按统一时长交卷---开考时间
                config.el = `startDate${self.config.data.time}`;
                // config.maxDate = '#F{$dp.$D(\''+`latestStartDate${self.config.data.time}`+'\')}';
            }
            if(self.config.data.projectStartDateL)        //项目起始时间
                config.minDate = typeof self.config.data.projectStartDateL == 'number'?moment(self.config.data.projectStartDateL).format('YYYY-MM-DD HH:mm:ss'):self.config.data.projectStartDateL
            if(self.config.data.projectEndDateL)        //项目结束时间
                config.maxDate = typeof self.config.data.projectEndDateL == 'number'?moment(self.config.data.projectEndDateL).format('YYYY-MM-DD HH:mm:ss'):self.config.data.projectEndDateL
            WdatePicker_Open(config)
        }).on('click','.endDate',(e)=>{
            $(e.target).removeClass('failure')
            let config = {
                dateFmt:'yyyy-MM-dd HH:mm:ss',
                isShowClear:false
            }
            if($(e.target).hasClass('endDateL')){                         //按统一时点交卷---结束时间
                config.el = `endDateL${self.config.data.time}`;
                // config.minDate = '#F{$dp.$D(\''+`startDateL${self.config.data.time}`+'\')}'
                config.onpicked = ()=>{
                    if(!self.limitTime().judge($(e.target).parents('.right').find('.startDate').val(),$(e.target).val())){
                        new WarnTip($(e.target).parent(),'结束时间不能小于开始时间',{left:0,top:'40px'})
                        $(e.target).val($(e.target).data('value') || '')
                    }else if(self.limitTime().delay()){                        //选择时间后判断是否符合规则
                        new WarnTip($(e.target).parent(),'最晚开考时间不能超过考试截止时间',{left:0,top:'40px'})
                        $(e.target).val($(e.target).data('value') || '')
                    }else{
                        $(e.target).data('value',$(e.target).val())
                    }
                }
            }else{                                                       //按统一时长交卷---结束时间
                config.el = `latestStartDate${self.config.data.time}`;
                // config.minDate = '#F{$dp.$D(\''+`startDate${self.config.data.time}`+'\')}';
                config.onpicked = ()=>{
                    if(self.limitTime().duration()){                        //选择时间后判断是否符合规则
                        new WarnTip($(e.target).parent(),'最晚考试截止时间不能超过项目截止时间',{left:0,top:'40px'})
                        $(e.target).val($(e.target).data('value') || '')
                    }else{
                        $(e.target).data('value',$(e.target).val())
                    }
                }
            }
            if(self.config.data.projectStartDateL)        //项目起始时间
                config.minDate = typeof self.config.data.projectStartDateL == 'number'?moment(self.config.data.projectStartDateL).format('YYYY-MM-DD HH:mm:ss'):self.config.data.projectStartDateL
            if(self.config.data.projectEndDateL)        //项目结束时间
                config.maxDate = typeof self.config.data.projectEndDateL == 'number'?moment(self.config.data.projectEndDateL).format('YYYY-MM-DD HH:mm:ss'):self.config.data.projectEndDateL
            WdatePicker_Open(config)
        }).on('click','.account i',(e)=>{         //删除评卷人
            if(self.selectAccount){
                self.selectAccount.update($(e.target).parent().data('id'))
                $(e.target).parent().remove()
            }else{
                $(e.target).parent().remove()
                self.config.data.examiners = Array.from(self.$elem.find('.master .account'),(v)=>{
                    return {
                        name:$(v).data('name'),
                        account:$(v).data('id')
                    }
                })
            }
            this.initSelect()
        })


        $('.cui-textBoxContainer',this.$elem).on('focus', 'input', (e) => {
            $(e.target).removeClass('fail')
        }).on('keydown', 'input', (e) => { //限制输入的keyCode
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }
            return false;
        }).on('keyup', 'input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d+/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        width: '75px',
                        left:0,
                        'z-index': 10000
                    });
                }
            }
        }).on('blur', 'input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d+/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        width: '75px',
                        left:0,
                        'z-index': 10000
                    });
                }
            }
        })

        this.textBoxes[0].$el.on('change','input',(e)=>{
            if(this.textBoxes[0].getValidate()){
                self.delay()
            }else{
                this.textBoxes[0].setValue('');
            }
        })

        this.textBoxes[1].$el.on('change','input',()=>{
            if(this.textBoxes[1].getValidate()){
                self.duration()
            }else{
                this.textBoxes[1].setValue('');
            }
        })

    }
    duration(){
        let self = this;
        if(self.limitTime().duration()){
            new WarnTip(this.textBoxes[1].$el,'最晚考试截止时间不能超过项目截止时间',{left:0,top:'40px'},2000)
            setTimeout(()=>{
                self.textBoxes[1].setValue('')
                self.textBoxes[1].$el.find('input').addClass('hold').focus()
            },2000)
            return false;
        }
        return true;
    }
    delay(){
        let self = this;
        if(self.limitTime().delay()){
            new WarnTip(this.textBoxes[0].$el,'最晚开考时间不能超过考试截止时间',{left:0,top:'40px'},2000)
            setTimeout(()=>{
                self.textBoxes[0].setValue('')
                self.textBoxes[0].$el.find('input').addClass('hold').focus()
            },2000)
            return false;
        }
        return true;
    }
    verity(){           //验证
        var self = this;
        var verityCode = true;

        if(this.radioGroup[0].getValue()=='1'){        //按统一时点交卷
            if(this.$elem.find('.startDateL').val()==''){
                this.$elem.find('.startDateL').addClass('failure');
                new WarnTip(this.$elem.find('.startDateL').parent(),'请选择开始时间',{left:0,top:'40px'})
                verityCode = false;
            }
            if(this.$elem.find('.endDateL').val()==''){
                this.$elem.find('.endDateL').addClass('failure');
                new WarnTip(this.$elem.find('.endDateL').parent(),'请选择结束时间',{left:0,top:'40px'})
                verityCode = false;
            }
            if(!self.limitTime().judge(this.$elem.find('.startDateL').val(),this.$elem.find('.endDateL').val())){
                this.$elem.find('.startDateL,.endDateL').val('').addClass('failure');
                cui.popTips.error('开始时间不能大于结束时间')
                verityCode = false;
            }
            else if(!self.delay()){
                verityCode = false;
            }
        }else{
            if(this.$elem.find('.startDate:eq(1)').val()==''){
                this.$elem.find('.startDate:eq(1)').addClass('failure');
                new WarnTip(this.$elem.find('.startDate:eq(1)').parent(),'请选择开始时间',{left:0,top:'40px'})
                verityCode = false;
            }
            if(this.$elem.find('.endDate:eq(1)').val()==''){
                this.$elem.find('.endDate:eq(1)').addClass('failure');
                new WarnTip(this.$elem.find('.endDate:eq(1)').parent(),'请选择结束时间',{left:0,top:'40px'})
                verityCode = false;
            }
            if($.trim(this.textBoxes[1].getValue())==''){

                this.textBoxes[1].$el.find('input').val('').focus().blur()
                verityCode = false;

            }else if(!self.limitTime().judge(this.$elem.find('.startDate:eq(1)').val(),this.$elem.find('.endDate:eq(1)').val())){

                this.$elem.find('.startDate:eq(1),.endDate:eq(1)').val('').addClass('failure');
                cui.popTips.error('开始时间不能大于结束时间')
                verityCode = false;

            }else if(!self.duration()){
                verityCode = false;
            }
        }
        return verityCode;
    }
    limitTime(){
        let self = this;
        return {
            delay:()=>{
                let start = moment(this.$elem.find('.startDateL').val()).valueOf()
                let delay = self.textBoxes[0].getValue()?parseInt(self.textBoxes[0].getValue())*60*1000:0
                let end = moment(this.$elem.find('.endDateL').val()).valueOf()
                return start+delay>end;
            },
            duration:()=>{
                let end = moment(this.$elem.find('.endDate:eq(1)').val()).valueOf()
                let time = self.textBoxes[1].getValue()?parseInt(self.textBoxes[1].getValue())*60*1000:0
                let endDate = self.config.data.projectEndDateL || 0
                if(endDate == 0)
                    return false

                return end+time>endDate
            },
            judge:(s,e)=>{
                if(!s||!e)
                    return true;
                let start = moment(s).valueOf()
                let end = moment(e).valueOf()
                return start<=end
            }
        }
    }
    on(event,fn){         //监听
        if(!this.eventList){
            this.eventList = {}
        }
        this.eventList[event] = fn;
    }
    emit(event,data={}){        //触发
        this.eventList[event](data)
    }
}
export default EditPaper;
