/*
 * @Author: zyuan
 * @Date:   2016-12-21 09:41:48
 * @Last Modified by:   zyuan
 * @Last Modified time: 2016-12-21 17:36:04
 */

'use strict';

import cui from 'c-ui'
import juicer from 'juicer'
import udpTpl from '../tpl/updatePaper.html'
import ProjectListDao from '../../../dao/projectManagement/projectList'
import SuccessTips from '../../../components/tips/successTip'

class UpdatePaper {
    constructor(data) {
        this.data = data || '';
        this.initModal();
    }
    initModal() {
        let renderData = {
            projectName: this.data.proName + this.data.curTime
        }
        if (renderData.projectName.length > 100) {
            renderData.projectName = renderData.projectName.slice(0, 100) + '...';
        }
        let tplHtml = $(juicer(udpTpl).render(renderData)),
            tmpHeader = $(`<span>版本更新</span>`),
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
        $('.updatePaper').on('click', '.confirm', (e) => {
            this.handleConfirm(e);
        })
    }
    handleConfirm(e) {
        let proName = $('.copyProject .cui-textBoxContainer input[type=text]').val();
        let opts = {
            accessToken: this.data.accessToken,
            name: proName.length > 100 ? proName.slice(1, 100) : proName,
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
