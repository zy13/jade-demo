/*
 * @Author: zyuan
 * @Date:   2016-12-21 09:41:48
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-20T14:50:36+08:00
 */

'use strict';

import cui from 'c-ui'
import juicer from 'juicer'
import copyTpl from '../tpl/copyProject.html'
import ProjectListDao from '../../../dao/projectManagement/projectList'
import SuccessTips from '../../../components/tips/successTip'

class CopyProject {
    constructor(data) {
        this.data = data || '';
        this.initModal();
    }
    initModal() {
        let renderData = {
            projectName: this.data.proName + this.data.curTime
        }
        if (renderData.projectName.length > 100) {
            renderData.projectName = this.data.proName.slice(0, 100 - this.data.curTime.length) + this.data.curTime
        }
        let tplHtml = $(juicer(copyTpl).render(renderData)),
            tmpHeader = $(`<span>复制项目</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken();

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '610px'
        });

        this.modal.open();
        this.copyTxtBox = Array.from($('.copyProject .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.handleInput();

        this.modal.on('modalClose', () => this.modal.$container.remove());
        $('.cancel').on('click', () => this.modal.$container.remove());
    }
    handleInput() {
        $('.copyProject').on('keyup', '.cui-textBoxContainer input', (e) => {
            let $this = $(e.currentTarget);
            if($this.val().length>=100){
                cui.popTips.warn('项目名称长度不能超过100位')
            }

        }).on('click', '.confirm', (e) => {
            this.handleConfirm(e);
        })
    }
    handleConfirm(e) {
        let proName = $('.copyProject .cui-textBoxContainer input[type=text]').val();
        if (!proName)
            return
        let opts = {
            accessToken: this.data.accessToken,
            name: proName.length > 100 ? proName.slice(0, 100) : proName,
            sourceProjectId: this.data.sourceProjectId
        }
        ProjectListDao.copyProject(opts).then((res) => {
            if (res && res.code == 0) {
                new SuccessTips('复制成功', '', true);
            } else {
                return cui.popTips.error(res.message);
            }
        }).catch((err) => {
            return cui.popTips.error('网络错误！');
        })
    }
}

export default CopyProject
