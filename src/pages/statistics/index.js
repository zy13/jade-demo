/*
 * @Author: zyuan
 * @Date:   2017-01-04 15:22:45
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T10:53:08+08:00
 */

'use strict';

import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './index.less'

import $ from 'jquery'
import cui from 'c-ui'
import staticDao from '../../dao/projectManagement/statistics'
import session from '../../dao/sessionContext'
import {
    FormOptions
} from '../../components/share/tools';

const fo = new FormOptions();

class StaticDemo {
    constructor() {
        this.init();
    }
    init() {
        this.txtBox = Array.from($('.search-filter .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.selBox = Array.from($('.search-filter .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.getContext();
    }
    getContext() {
        let self = this;

        session.customer().then((res) => {
            self.context = res;
        });
        this.handleEvents();
    }
    handleEvents() {
        $('.wrap').on('click', '.main-action a.pay', () => { //导出消费记录
            if (!this.context) {
                return cui.popTips.error('网络错误！')
            } else {
                staticDao.exportConsume(this.context.accessToken);
            }
        }).on('click', '.main-action a.consume', () => { //导出购买记录
            if (!this.context) {
                return cui.popTips.error('网络错误！')
            } else {
                staticDao.exportPays(this.context.accessToken);
            }
        }).on('click', '.search-ent button.btn', () => { //搜索
            this.handleSearchData();
        }).on('click', '#project .cui-options li', (e) => { //搜索项目
            $('#projectId').val($(e.currentTarget).data('value'));
            this.handleSearchData();
        }).on('click', '#task .cui-options li', (e) => {
            $('#taskId').val($(e.currentTarget).data('value')); //搜索产品
            this.handleSearchData();
        })
    }
    handleSearchData() {
        let searchModel = new Object();
        let projectId = this.selBox[0] ? (this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('#projectId').val()) : 0;
        let taskId = this.selBox[1] ? (this.selBox[1].getValue() ? this.selBox[1].getValue().value : $('#taskId').val()) : 0;
        if(projectId == '' || projectId == 0){
            taskId = '';
        }
        searchModel.projectId = projectId;
        searchModel.taskId = taskId;
        searchModel.key =  encodeURIComponent(this.txtBox[0].getValue());
        searchModel.searchType =$('#searchType').val();

        window.location.href = `/customer/statistics/index?${fo.toPostString(searchModel)}`;
    }
}
let staticIns = new StaticDemo();
