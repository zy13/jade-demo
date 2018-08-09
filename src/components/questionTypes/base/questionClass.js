/**
 * @Author: Jet.Chan
 * @Date:   2016-12-26T10:18:07+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-13T15:46:39+08:00
 */

import questionDao from '../../../dao/examManagement/question';
import session from '../../../dao/sessionContext';
import cui from 'c-ui';
import SuccessTip from '../../tips/successTip';
import loading from '../../loading/index'
import ComfirmTip from '../../tips/deleteTip';
import WarnTip from '../../tips/warnTip';

const toolbars = [
    ['undo', 'redo', 'bold', 'italic', 'underline',
        'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
        'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
        'lineheight', 'removeformat', 'simpleupload', 'insertorderedlist',
        'insertunorderedlist', 'link', 'inserttable'
    ]
]

class questionClass {
    constructor() {
        this.wordLimit = 10000;
    }
    getValue() {
        return this.model;
    }

    changeType(data, callback) {
        session.customer().then((r) => {
            data.paperUnicode = $('#paperUnicode').val()
            data.accessToken = r.accessToken
            questionDao.changeType(data).then((r) => {
                if (r.code == 0) {
                    callback(r);
                } else {
                    loading.close()
                    cui.popTips.error(r.message);
                }
            })
        }).catch((err) => {
            loading.close()
            cui.popTips.error(err);
        })
    }

    save(data, callback) {
        session.customer().then((r) => {
            data.paperUnicode = $('#paperUnicode').val()
            data.accessToken = r.accessToken
            return questionDao.saveSubject(data).then((r) => {
                if (r.code == 0) {
                    new SuccessTip('保存成功',null,false,800);
                    callback(r);
                } else {
                    loading.close()
                    cui.popTips.error(r.message);
                }
            })
        }).catch((err) => {
            loading.close()
            cui.popTips.error(err);
        })
    }

    add(data, callback) {
        let accessToken;
        session.customer().then((r) => {
            accessToken = r.accessToken
            return questionDao.addSubject({
                accessToken: r.accessToken,
                jsonStr: data.jsonStr,
                subject: data.subject,
                paperId: data.paperId
            }).then((r) => {
                if (r.code == 0) {
                    if (callback) callback(r);
                    let paperUnicode = $('#paperUnicode').val(),
                        arr = [];

                    $('.sp-question>div').each((i,v)=>{
                        let id = $(v).data('id') || $(v).find('[name=id]').val()
                        if(id)
                            arr.push(id)
                    })
                    questionDao.saveUnicode(accessToken, paperUnicode, JSON.stringify(arr))
                } else {
                    loading.close();
                    cui.popTips.error(r.message);
                }
            })
        }).catch((err) => {
            loading.close();
            cui.popTips.error(err);
        })
    }

    delete(data, callback) {
        let accessToken;

        session.customer().then((r) => {
            accessToken = r.accessToken
            return questionDao.deleteSubject(r.accessToken, data.unicode).then((r) => {
                if (r.code == 0) {
                    new SuccessTip('删除成功',null,false,800);
                    if (callback) callback(r);
                    let paperUnicode = $('#paperUnicode').val()
                    let jsonStr = JSON.stringify(Array.from($('.sp-question>div'), (v) => {
                        if($(v).data('id'))
                            return $(v).data('id')
                    }));
                    questionDao.saveUnicode(accessToken, paperUnicode, jsonStr)
                } else {
                    cui.popTips.error(r.message);
                }
            })
        }).catch((err) => {
            cui.popTips.error(err);
        })
    }

    appendToSpecifyElem($container, tpl, callback, isbefore = false) {
        let $tpl = $(tpl);
        $tpl.hide();
        if (!isbefore)
            $container.append($tpl);
        else
            $container.before($tpl)
        $tpl.fadeToggle(1000, () => {
            if (callback) callback();
        });
        $("html,body").animate({
            scrollTop: $tpl.position().top
        }, 1000);
    }

    displaceTpl($curr, $targetTpl, callback) {
        $targetTpl.hide();
        $curr.before($targetTpl);
        $curr.slideUp(200, () => {
            $curr.remove();
            $targetTpl.slideDown(200, () => {
                // $("html,body").animate({
                //     scrollTop: $targetTpl.position().top
                // }, 1000);
                if (callback) callback();
            });
        });
    }

    //获取是否存在编辑状态的控件 true：是  false：否
    getEditControlLength() {
        let contrl = $('.sp-question .set-upload-question,.set-question,.set-explain');
        if (contrl.length > 0) {
            cui.popTips.warn('请先保存在编辑的题目', 1500);
            setTimeout(() => {
                $('html,body').animate({
                    scrollTop: contrl.position().top
                }, 1000);
            }, 1500);
            return true;
        }
        return false;
    }

    getCurrentEditControl() {
        return $('.sp-question .set-upload-question,.set-question,.set-explain');
    }

    initUEditor($elems) {
        let ues = [];
        // console.log($elems);
        $elems.map((v, k) => {
            // console.log($(k).parent().width());
            // console.log($(k).parent().height());
            let id = $(k).attr('id')

            ues.push({
                key: id,
                ue: UE.getEditor(id, {
                    initialFrameWidth: $(k).parent().width() - 2,
                    initialFrameHeight: $(k).parent().height() - 57,
                    autoHeightEnabled: false,
                    toolbars: toolbars,
                    elementPathEnabled: false,
                    enableAutoSave: false,
                    wordCount: false
                })
            })
            if($(k).data('placeholder')){
                ues[ues.length-1].ue.placeholder($(k).data('placeholder'))
            }
        })

        // console.log(ues);
        return ues;
    }

    checkWordLimit($tpl,editUes){
        let self = this,verify = true;
        for(let v of editUes){
            if(v.ue.getContentTxt().length>self.wordLimit){
                let $el = $('#'+v.key)
                $el.css({
                    position:'relative'
                })
                new WarnTip($el,'内容长度不能超过10000',{'z-index':10000,top:($el.height()+5),left:0})
                verify = false;
            }
        }
        if(!verify){
            $tpl.addClass('failure');
            $tpl.off('click')
            setTimeout(()=>{
                $tpl.one('click',(e)=>{
                    $(e.target).removeClass('failure')
                })
                let fn = ()=>{
                    $tpl.removeClass('failure')
                }
                for(let v of self.editUes){
                    v.ue.addListener('click',fn,true)
                }
            })
        }
        return verify;
    }

    copyAndDelete($tpl,instance,copy=false){
        let self = this;
        //复制按钮
        $('.copy', $tpl).on('click', (e) => {
            if (!this.getEditControlLength()) {
                new ComfirmTip(() => {
                    let $this = $(e.currentTarget),
                        dataConf = $tpl.data('value');
                    if (typeof dataConf != "object")
                        dataConf = JSON.parse(dataConf);
                    //TODO：需要判断什么类型的选项,渲染不同模版
                    if(!dataConf.paperId)
                        dataConf.paperId = $('#paperUnicode').val()
                    if(copy)
                        instance.addSubject(dataConf,$tpl,true);
                    else
                        instance.addSubject(dataConf);
                }, {
                    title: '复制提示',
                    content: '请确认是否复制',
                    isAuto: false
                })
            }
        })

        //删除按钮
        $('.delete', $tpl).on('click', (e) => {
            //判断没有题目在编辑
            if (!this.getEditControlLength()) {
                new ComfirmTip(() => {
                    let $this = $(e.currentTarget),
                        $item = $tpl;
                    let unicode = $item.data('id');

                    setTimeout(() => {
                        loading.open();
                        this.delete({
                            unicode
                        }, (r) => {
                            $item.remove();
                            self.updateSortNum('.order-num .sortNum')
                            setTimeout(() => {
                                loading.close();
                            }, 200);
                        });
                    }, 200);
                }, {
                    title: '删除提示',
                    content: '请确认是否删除',
                    isAuto: false
                })
            }
        })
    }

    // checkMove($tpl){
    //     $('.moveup',$tpl).on('click',(e)=>{
    //         let $paging = $(e.target).prev('.sp-paging')
    //         if($paging.length>0 && $paging.index('.sp-paging')==0){
    //             return
    //         }
    //     })
    // }

    updateSortNum(name){
        let num = 1;
        $(name).each((i,v)=>{
            $(v).text((i+1))
            num++;

            //更新题序之后要同时更新储存在某个dom里面的数据，以保持数据的统一
            let dataConf = $(v).parents('.preview-question').find('.edit.cui-button').data('value')
            if(dataConf){
                if(typeof dataConf == 'string')
                    dataConf = JSON.parse(dataConf)
                dataConf.sortNum = i+1;
                $(v).parents('.preview-question').data('value',JSON.stringify(dataConf))
                    .find('.edit.cui-button').data('value',JSON.stringify(dataConf))
                this.$container.createIndex = num;
                //分页的序号和题序共用这个update的函数，所以要判断只有update题序时才改变createIndex
            }

        })
    }

    // checkNotLast($tpl){
    //     if($tpl.prevUntil('.sp-paging').length>0||$tpl.nextUntil('.sp-paging').length>0){
    //         return true
    //     }else{
    //         cui.popTips.warn('')
    //         return false
    //     }
    // }

}
export default questionClass;
