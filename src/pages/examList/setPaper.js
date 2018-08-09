/*
 * @Author: sihui.cao
 * @Date:   2016-12-21 10:08:38
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-19T10:16:59+08:00
 */

'use strict';
import cui from 'c-ui'
import "../../components/ueditor"
import session from '../../dao/sessionContext'
import dao from '../../dao/examManagement/question'
import '../../components/commonTab/style.less'
import '../../components/share/hfCommon'
import '../../components/ueditor'
import './setPaper.less'
import loading from '../../components/loading'
import ajaxFileUpload from '../../components/ajaxFileUpload/index'
import multi_selection from '../../components/questionTypes/multi_selection'
import single_selection from '../../components/questionTypes/single_selection'
import paging from '../../components/questionTypes/paging'
import objective_fill from '../../components/questionTypes/objective_fill'
import subjectivity_fill from '../../components/questionTypes/subjectivity_fill'
import upload_selection from '../../components/questionTypes/upload_selection'
import explain from '../../components/questionTypes/explain'
import ComfirmTip from '../../components/tips/deleteTip'
import SuccessTip from '../../components/tips/successTip'

import '../../components/share/clickSort';

const $container = $('.sp-question'),
    paperId = $('#paperUnicode').val() || 1;

//创建试卷的开始循序
$container.createIndex = 1;

$(() => {
    let fn = (e) => {
        if ($('.sp-question .set-upload-question,.set-question,.set-explain').length > 0) {
            cui.popTips.warn('请保存当前处于编辑的题目，再移动位置', 3000);
            return false;
        }
        if ($(e.target).hasClass('moveup')) {
            let $paging = $(e.target).parents('.preview-question').prev('.sp-paging')
            if ($paging.length > 0 && $paging.index('.sp-paging') == 0) {
                cui.popTips.warn('无法上移')
                return false;
            }
        } else {
            if ($(e.target).parents('.preview-question')[0] == $('.sp-question>div:last')[0]) {
                cui.popTips.warn('无法下移')
                return false;
            }
        }
        return true;
    }
    let after = (e) => {
        let paperUnicode = $('#paperUnicode').val()
        let jsonStr = JSON.stringify(Array.from($('.sp-question>div'), (v) => $(v).data('id')));
        session.customer().then((r) => {
            return dao.saveUnicode(r.accessToken, paperUnicode, jsonStr).then((r) => {
                if (r && r.code == 0)
                    console.log('移动成功')
            })
        })
        $('.order-num .sortNum').each((i, v) => {
            $(v).text((i + 1))
        })
    }
    let judgeType = (fileName)=>{ //判断文件类型
        let fileSuffix = fileName.slice(fileName.lastIndexOf(".") + 1); //后缀
        if (fileSuffix == 'xls' || fileSuffix == 'xlsx') {
            return true;
        }
        cui.popTips.warn('文件类型有误')
        return false;
    }
    //题目换位动画
    $container.clickSort({
        speed: 500,
        beforeFunc: fn,
        afterFunc: after
    });
    //左边操作栏悬浮效果
    let $window = $(window);
    let initialLeft = $('.sp-sidebar-wrap').position().left;
    $window.scroll(() => {
        let questionNameElm = $('.sp-paper-name'),
            leftOptionElm = $('.sp-sidebar-wrap'),
            sp_question = $container,
            currLeft = initialLeft - $window.scrollLeft();
        if ($window.scrollTop() > questionNameElm.position().top &&
            sp_question.height() >= leftOptionElm.height()) {
            leftOptionElm.css({
                position: 'fixed',
                top: 0,
                left: currLeft
            })
        } else {
            leftOptionElm.removeAttr('style');
        }
    })

    new setPaper();
    Array.from($('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)))




    //批量上传
    $('#importBtn').on('click', () => {
        let tmpHeader = $('<span>导入题目</span>');
        let html = `<div class="import-block">
                        <div>
                            <p><span class="name">选择导入文件：</span></p>
                            <div class="cui-textBoxContainer inline" data-rule="" data-tips="">
                                <input type="tel" placeholder="" readonly class="filename"/>
                            </div>
                            <input id="importQues" class="file" type='file' name='importQues' >
                            <a class="cui-button preset-blue selectFile">
                                <span>选择文件</span>
                            </a>
                            <p class="tr download"><a href="/download/TAS5.0考试题目导入导出模板.xlsx">模板下载</a></p>

                        </div>
                        <p class="btns">
                            <a class="cui-button preset-blue sure">
                                <span>确定</span>
                            </a><a class="cui-button cancle">
                                <span>取消</span>
                            </a>
                        </p>
                    </div>`
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        let modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '656px',
            height: '330px'
        });
        modal.open();
        modal.on('modalClose', () => {
            modal.$container.remove()
        })


        modal.$el.on('click', '.sure', () => {
            if ($('.filename').val() == '') {
                cui.popTips.warn('请选择导入文件');
                return;
            }
            loading.open()
            session.customer().then((r) => {
                return dao.importQues('importQues', {
                    file: 'importQues',
                    accessToken: r.accessToken,
                    paperUnicode: $('#paperUnicode').val()
                })
            }).then((r) => {
                loading.close()
                if (r && r.code == 0) {
                    modal.$el.find('.filename').val('')
                    new SuccessTip(r.response ? `成功导入${r.response}道题` : `成功导入0道题`, null, true);
                } else {
                    $('#importQues')[0].outerHTML = $('#importQues')[0].outerHTML;
                    $('#importQues').val('')
                    modal.$el.find('.filename').val('')
                    cui.popTips.error(r.message)
                }
            }).catch((err) => {
                loading.close()
                $('#importQues')[0].outerHTML = $('#importQues')[0].outerHTML;
                $('#importQues').val('')
                modal.$el.find('.filename').val('')
                cui.popTips.error('导入失败')
            })
        }).on('click', '.cancle', () => {
            modal.close()
        }).on('change', '#importQues', (e) => {
            if($(e.target).val()){
                let file = e.target.files ? e.target.files[0] : $(e.target).val(),
                    fileName = e.target.files ? file.name : file.slice(file.lastIndexOf("\\") + 1),
                    type = judgeType(fileName)
                if (type) {
                    modal.$el.find('.filename').val(fileName)
                } else {              //类型不符合
                    modal.$el.find('.filename').val('');
                }
            }else{
                modal.$el.find('.filename').val('');
            }
        })


    })


    //下一步
    $('.setting-action').on('click', '.next', () => {
        if ($('.preview-question:not(.sp-paging)').length > 0 || $('.set-question,.set-upload-question').length > 0) { //题目数大于0
            let contrl = $('.sp-question .set-upload-question,.set-question,.set-explain');
            if (contrl.length > 0) {

                cui.popTips.warn('请先保存在编辑的题目', 1500);
                setTimeout(() => {
                    $('html,body').animate({
                        scrollTop: contrl.position().top
                    }, 1000);
                }, 1500);

            } else {
                let mode = $('#mode').val(),
                    paperId = $('#paperId').val(),
                    paperUnicode = $('#paperUnicode').val(),
                    jsonStr = JSON.stringify(Array.from($('.sp-question>div'), (v) => $(v).data('id')));

                loading.open()
                session.customer().then((r) => {
                    let accessToken = r.accessToken;
                    return dao.saveUnicode(accessToken, paperUnicode, jsonStr)
                }).then((r) => {

                    if (r && r.code == 0) {
                        window.location.href = `/customer/examList/setScore/${paperUnicode}?mode=${mode}&paperId=${paperId}`
                    } else {
                        cui.popTips.error(r.message)
                    }
                    loading.close()

                }).catch((err) => {
                    loading.close()
                    cui.popTips.error(err);
                })
            }
        } else {
            cui.popTips.warn('请至少添加一道题目');
        }
    })



})

class setPaper {
    constructor() {
        this.getQues()
        this.initLeftControlEvents();
    };
    getQues() {
        let self = this;
        loading.open();
        session.customer().then((r) => {
            return dao.getQuesDetail(paperId, r.accessToken)
        }).then((r) => {
            if (r && r.code == 0) {
                if (r.response) {
                    self.render(r.response)
                }
            } else {
                cui.popTips.error(r.message)
            }
        }).catch((err) => {
            cui.popTips.error('出错啦');
            loading.close();
        })
    }
    render(response) {
        let data = response.items
        $('.sp-paper-name').text(response.name)
            for (let v of data) {
                if (!v)
                    continue;
                if (v.type == 4) {
                    //单选题
                    v.sortNum = $container.createIndex;
                    v.dataString = JSON.stringify(v);
                    let ms = new single_selection($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                    $container.createIndex++;
                }
                if (v.type == 5) {
                    //多选题
                    v.sortNum = $container.createIndex;
                    v.dataString = JSON.stringify(v);
                    let ms = new multi_selection($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                    $container.createIndex++;
                }
                if (v.type == 6 && v.dBlankStemSetting && v.dBlankStemSetting.type == '1') {
                    //客观填空题
                    v.sortNum = $container.createIndex;
                    v.dataString = JSON.stringify(v);
                    let ms = new objective_fill($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                    $container.createIndex++;
                }
                if (v.type == 6 && v.dBlankStemSetting && v.dBlankStemSetting.type == '0') {
                    //主观填空题
                    v.sortNum = $container.createIndex;
                    v.dataString = JSON.stringify(v);
                    let ms = new subjectivity_fill($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                    $container.createIndex++;
                }
                if (v.type == 2) {
                    //分页符
                    v.sortNum = ++$('.sp-paging').length;
                    v.dataString = JSON.stringify(v);
                    let ms = new paging($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                }
                if (v.type == 3) {
                    //说明
                    v.dataString = JSON.stringify(v);
                    let ms = new explain($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                }
                if (v.type == 7) {
                    //上传题
                    v.sortNum = $container.createIndex;
                    v.dataString = JSON.stringify(v);
                    let ms = new upload_selection($container);
                    ms.showPreview(v, $('<div></div').appendTo($('.sp-question')))
                    $container.createIndex++;
                }
            }

            if ($('body #mode').val() == '1' && data.length <= 0) {
                let pg = new paging($container);
                pg.addSubject({
                    paperId,
                    isCanDelete: false
                }, false, $('<div class="tempdiv"></div').appendTo($('.sp-question')));
            } else {
                $('.sp-paging').first().find('i.cpf-icon-ic_close').css('visibility', 'hidden');
            }

            //撤掉遮盖层
            loading.close();
        }
        //左侧事件
    initLeftControlEvents() {
        // this.multi_selection = new multi_selection($container);
        //单选
        $('.ques-type .single').on('click', () => {
                let ms = new single_selection($container);
                ms.addSubject({
                    paperId
                })
            })
            //多选
        $('.ques-type .multiple').on('click', () => {
                let ms = new multi_selection($container);
                ms.addSubject({
                    paperId
                })
            })
            //客观填空
        $('.ques-type .obj-completion').on('click', () => {
                let ms = new objective_fill($container);
                ms.addSubject({
                    paperId
                })
            })
            //主观填空
        $('.ques-type .sub-completion').on('click', () => {
                let ms = new subjectivity_fill($container);
                ms.addSubject({
                    paperId
                })
            })
            //上传
        $('.ques-type .upload').on('click', () => {
                let ms = new upload_selection($container);
                ms.addSubject({
                    paperId
                })
            })
            //分页
        $('.assist .paging').on('click', () => {
                let pg = new paging($container);
                pg.addSubject({
                    paperId
                })
            })
            //说明
        $('.assist .explain').on('click', () => {
            let pg = new explain($container);
            pg.addSubject({
                paperId
            })
        })
    }
}
