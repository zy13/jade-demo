/*
* @Author: zyuan
* @Date:   2016-12-26 18:55:44
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-01-21 18:28:05
*/

'use strict';
import * as tools from '../../components/share/tools'
import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './preview.less'
import WarnTip from '../../components/tips/warnTip'
import cui from 'c-ui'

class previewDemo{
    constructor(){
        this.init();
    }
    init(){
        this.txtBox=Array.from($('.cui-textBoxContainer'),(v)=>new cui.TextBox($(v)))
        this.radio=Array.from($('.cui-radioGroupContainer'),(v)=>new cui.RadioGroup($(v)))
        this.radio=Array.from($('.cui-checkboxContainer'),(v)=>new cui.Checkbox($(v)))
        this.watch()
        if(tools.pageHelper.urlContext()['quesNo'])
            this.toQues(tools.pageHelper.urlContext()['quesNo'])
    }
    toQues(name){
        setTimeout(()=>{
            $("html,body").scrollTop($(`#${name}`).position().top - 72);
        },0)

    }
    watch(){
        let count = 0;
        $('.title-group').on('click','.cpf-icon',(e)=>{//收缩与展开
            count++;
            $(e.currentTarget).toggleClass('cpf-icon-extend cpf-icon-shrink');
            if(count%2==1){
                $('.area-ts').hide();
            }else{
                $('.area-ts').show();
                if(parseInt($('.lnums').text(), 10)>30){
                    $('.span-group').css({
                        'height': '116px'
                    })
                    $('.linkmore').show();
                }else{
                    $('.span-group').css({
                        'height': 'auto'
                    })
                }
            }
        }).on('click','.more',(e)=>{
            $('.span-group').css({
                'height': 'auto'
            });
            $('.linkmore').hide();
        })

        $('.selection .options-item').on('click','.option-wrap',(e)=>{
            $(e.currentTarget).prev('.option-index').find('input').click()
        })
        $('.area-ts .groups a').on('click',(e)=>{
            // debugger;
            let val = parseInt($(e.currentTarget).data('value')),
                arr = JSON.parse($('#pageList').val()),
                p = tools.pageHelper.urlContext()['pageNo'] || 1,
                paperUnicode= $('#paperUnicode').val()
                count = 0
            for(let i in arr){
                count += arr[i].itemSize
                if(count>=val){
                    if(p!=arr[i].pageIndex){
                        window.location.href=`/customer/examList/list/preview/${paperUnicode}?pageNo=${arr[i].pageIndex}&quesNo=quesNo${val}`
                    }else{
                        this.toQues(`quesNo${val}`)
                    }
                    return;
                }
            }
        })
        $('.jumpPage').on('blur','input',(e)=>{
            let page = $(e.target).val(),
                paperUnicode= $('#paperUnicode').val()
            if(page!=''){
                window.location.href=`/customer/examList/list/preview/${paperUnicode}?pageNo=${page}`
            }
        }).on('keydown','input',(e)=>{
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true
            }
            return false;
        }).on('keyup','input',(e)=>{
            let val = parseInt(e.target.value),
                totalPage = parseInt($('#totalPage').val()),
                paperUnicode= $('#paperUnicode').val()

            if (e.target.value!='') {
                let reg = new RegExp(/^\d+/)
                if (isNaN(val)||!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        width: '107px',
                        'z-index': 10000
                    });
                }else if(!isNaN(totalPage)&&val>totalPage){
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '不能大于总页码', {
                        width: '107px',
                        'z-index': 10000
                    });
                }else if(val==0){
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '不能小于0', {
                        width: '57px',
                        'z-index': 10000
                    });
                }else if(e.keyCode==13){
                    window.location.href=`/customer/examList/list/preview/${paperUnicode}?pageNo=${val}`
                }
            }
        })
    }

}
let previewIns = new previewDemo();
