/*
 * @Author: zyuan
 * @Date:   2017-02-13 17:13:23
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-03-13 21:22:05
 */

'use strict';

import juicer from 'juicer'
import session from '../../dao/sessionContext/index'
import exerciseDao from '../../dao/examManagement/exercise'
// import './tpl/index.html'
import './style.less'

class CheckImgs {
    constructor(data) {
        this.config = data;
        this.init();
    }
    init() {
        this.handleEvents();
    }
    handleEvents() {
        let $elem = this.config.$elem;
        let countLeft = 0;
        let countRight = 0;

        if (!$elem.siblings('div').is('.like-modal')) {
            if ($elem.parents('.img-group').find('.like-modal').length > 0) {
                $elem.parents('.img-group').find('.like-modal').remove()
            }
            let curImgPath = $elem.data('href');
            let imgPaths = [],
                imgNames = [];
            let curTemp = 0;

            $elem.closest('.img-group').find('.isImg').each((i, v) => {
                imgPaths.push($(v).data('href'));
                imgNames.push($(v).data('name'));
            })
            let renderData = {
                curImgPath: curImgPath,
                imgPaths: imgPaths,
                imgNames: imgNames,
                spans: '',
                actImgPaths: '',
                actImgNames: ''
            }

            for (let i = 0; i < renderData.imgPaths.length; i++) {
                if (renderData.imgPaths[i] == renderData.curImgPath) {
                    curTemp = i;
                    renderData.curTemp = i;
                    break;
                }
            }
            renderData.actImgPaths = renderData.imgPaths[curTemp];
            renderData.actImgNames = renderData.imgNames[curTemp];
            renderData.spans = `<span class='active'>
                    <img src='${renderData.imgPaths[curTemp]}' data-name='${renderData.imgNames[curTemp]}'/>
                </span>`;

            for (let i = 0; i < renderData.imgPaths.length; i++) {
                if (i != curTemp) {
                    renderData.spans += `<span class=''>
                                <img src='${renderData.imgPaths[i]}' data-name='${renderData.imgNames[i]}'/>
                             </span>`
                }
            }

            $elem.closest('.cui-textBoxContainer')
                .append(juicer(require('./tpl/index.html')).render(renderData))
                .find('.group .imgs').append(renderData.spans).closest('.cui-textBoxContainer')
                .on('click', '.cui-panel-header .shrink', (e) => {
                    $(e.currentTarget).closest('.like-modal').remove();
                }).on('click', '.group .imgs span', (e) => {
                    let dataSrc = $(e.currentTarget).find('img').attr('src'),
                        dataName = $(e.currentTarget).find('img').data('name');
                    $(e.currentTarget).addClass('active').siblings('span').removeClass('active');
                    $(e.currentTarget).closest('.imgs-group').find('.default img').attr({
                        'src': dataSrc,
                        'data-name': dataName
                    })
                }).on('click', '.group .cpf-icon-ic_arrowleft', (e) => { //向左滑

                    if (countRight > 0) {
                        let offset = 68;
                        countRight--;
                        $('.group .imgs span').each((i, v) => {
                            let offsetTop = parseInt($(v).css('top'), 10)
                            let x = offset;

                            $(v).css({
                                position: 'relative',
                                top: offsetTop + x
                            })
                        })
                    }
                }).on('click', '.group .cpf-icon-ic_arrowright', (e) => { //向右滑
                    let len = $('.group .imgs span').length;
                    let countIndex = (len % 4 == 0) ? parseInt(len / 4, 10) - 1 : parseInt(len / 4, 10);

                    if (countRight < countIndex) {
                        countRight++;
                        if (countRight > 0) {
                            let offset = countRight * 68;

                            $('.group .imgs span').each((i, v) => {
                                if ($(v).is('.active')) {
                                    $('.group').append(`<div class='before division'></div>`)
                                }
                                $(v).css({
                                    position: 'relative',
                                    top: '-' + offset + 'px'
                                })
                            })
                        }
                    }
                });

            $('.download').on('click', (e) => {
                let imgName = $(e.currentTarget).closest('.cui-panel-header').siblings('.cui-panel-content').find('.active img').data('name');

                if (this.config.examerId != undefined) {
                    session.customer().then((r) => {
                        exerciseDao.downloadExamerImg({
                            taskId: this.config.taskId,
                            paperId: this.config.paperId,
                            examerId: this.config.examerId || '',
                            seqNo: this.config.seqNo
                        }, r.accessToken, imgName)
                    })
                } else {
                    session.user().then((r) => {
                        exerciseDao.downloadImg({
                            taskId: this.config.taskId,
                            paperId: this.config.paperId,
                            seqNo: this.config.seqNo
                        }, r.accessToken, imgName)
                    })
                }
            })
        }
    }
}

export default CheckImgs
