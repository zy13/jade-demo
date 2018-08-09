/*
* @Author: sihui.cao
* @Date:   2016-11-30 15:49:04
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-05-03 10:53:17
*/

'use strict';

import store from 'store2'
import * as tools from '../share/tools'



class HandleCheckbox{
    constructor(setting){
        this.config = setting
        if(!this.config.checkboxes || !this.config.checkboxes.length)
            return;

        this.ckbox = this.config.checkboxes;
        this.totalcheck = 0;
        this.init()
    }
    init(){
        let urlContext = tools.pageHelper.urlContext()
        if((!location.hash||location.hash!='#mark')&&(!urlContext['p'])){
            store.remove(this.config.name)
            location.hash = 'mark'
        }
        this.render()
        this.watch()
    }
    render(){
        let self = this;
        self.store = store.get(self.config.name)
        if(!self.store){                        //不存在
            self.store = {
                all:false,
                ids:''
            }
            return;
        }
        if(!self.store.all&&self.store.ids == '')
            return;
        let arr = self.store.ids?self.store.ids.split(','):[]     //存在
        let count = 0;
        self.ckbox.slice(2,self.ckbox.length).forEach((v,i)=>{
            let id = v.$el.attr('id')
            if(self.store.all){                 //勾选所有页
                if(!arr.find((_id)=>id==_id)){
                    arr.push(id)
                }
                v.val = true;
                v.$el.find('input[type=checkbox]')[0].checked = true;
            }else{
                if(arr.find((_id)=>id==_id)){
                    count++;
                    v.val = true;
                    v.$el.find('input[type=checkbox]')[0].checked = true;
                }
            }
        })

        if(self.store.all){
            self.ckbox[0].val = true;
            self.ckbox[0].$el.find('input[type=checkbox]')[0].checked = true;
            self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', true);

            self.ckbox[1].val = true;
            self.ckbox[1].$el.find('input[type=checkbox]')[0].checked = true;

            if(self.config.$count){
                self.totalcheck = self.config.total
                self.config.$count.text(self.config.total+'人')
            }
        }
        else{
            self.totalcheck = arr.length
            if(count>0&&count == (self.ckbox.length-2)){
                self.ckbox[0].val = true;
                self.ckbox[0].$el.find('input[type=checkbox]')[0].checked = true;
            }
            if(self.config.$count){
                self.config.$count.text(arr.length+'人')
            }
        }

    }
    watch(){
        let self = this;

        self.ckbox[0].$el.on('click','input',(e)=>{     //点击当前页

            let arr = self.store.ids?self.store.ids.split(','):[]
            let val = self.ckbox[0].getValue();
            self.ckbox.slice(2,self.ckbox.length).forEach((v,i)=>{
                let id = v.$el.attr('id') || ''
                if(val){
                    if(!arr.find((_id)=>_id==id))
                        arr.push(id)
                }else{
                    self.store.all = false;
                    if(arr.indexOf(id)>-1)
                        arr.splice(arr.indexOf(id),1)
                }
                v.val = val;
                v.$el.find('input[type=checkbox]')[0].checked = val;
            })

            if(arr.length == self.config.total){
                self.store.all = true;
                self.ckbox[1].val = true;
                self.ckbox[1].$el.find('input[type=checkbox]')[0].checked = true;
                self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', true);
            }

            self.store.ids = arr.join(',');
            store.set(self.config.name,self.store)
            self.config.$count.text(arr.length+'人')

        })

        self.ckbox[1].$el.on('click','input',(e)=>{     //点击所有页

            let arr = self.store.ids?self.store.ids.split(','):[]
            let val = self.ckbox[1].getValue();

            self.ckbox.slice(2,self.ckbox.length).forEach((v,i)=>{
                let id = v.$el.attr('id') || ''
                if(val){
                    if(!arr.find((_id)=>_id==id))
                        arr.push(id)
                }
                v.val = val;
                v.$el.find('input[type=checkbox]')[0].checked = val;
            })

            self.store.all = val;
            self.store.ids = val?arr.join(','):'';
            store.set(self.config.name,self.store);
            self.config.$count.text(val?self.config.total+'人':'0人')

            self.ckbox[0].val = val;
            self.ckbox[0].$el.find('input[type=checkbox]')[0].checked = val;
            if(val){
                self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', true);
            }
            else{
                self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', false);
            }

        })

        self.ckbox.slice(2,self.ckbox.length).forEach((v,i)=>{    //单个

            v.$el.on('click','input',(e)=>{
                let arr = self.store.ids?self.store.ids.split(','):[],
                    val = v.getValue(),
                    count = 0
                if(val){
                    let id = v.$el.attr('id')
                    if(!arr.find((n)=>n==id))   //不存在就添加
                        arr.push(id)

                    self.ckbox.slice(2,self.ckbox.length).forEach((n,k)=>{
                        if(n.getValue())
                            count++
                    })
                    if(count == (self.ckbox.length-2)){
                        self.ckbox[0].val = true;
                        self.ckbox[0].$el.find('input[type=checkbox]')[0].checked = true;
                    }
                    if(arr.length == self.config.total){
                        self.store.all = true;
                        self.ckbox[1].val = true;
                        self.ckbox[1].$el.find('input[type=checkbox]')[0].checked = true;
                        self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', true);
                    }

                }else{
                    let id = v.$el.attr('id'),
                        _arr = []
                    if(self.store.all){
                        self.ckbox.slice(2,self.ckbox.length).forEach((n,k)=>{
                            if(n.$el.attr('id')!=id){
                                _arr.push(n.$el.attr('id'))
                            }
                        })
                        arr = _arr;
                        self.store.all = false;
                    }else{
                        if(arr.indexOf(id)>-1)   //存在就删除
                            arr.splice(arr.indexOf(id),1)
                    }

                    self.ckbox[0].val = false;
                    self.ckbox[0].$el.find('input[type=checkbox]')[0].checked = false;
                    self.ckbox[0].$el.find('input[type=checkbox]').attr('disabled', false);

                    self.ckbox[1].val = false;
                    self.ckbox[1].$el.find('input[type=checkbox]')[0].checked = false;
                }

                self.store.ids = arr.join(',');
                store.set(self.config.name,self.store)
                self.config.$count.text(arr.length+'人')
            })

        })

    }
    getValue(){
        return this.store?this.store.ids:'';
    }
    destory(){
        store.remove(this.config.name)
    }
    delete(ids){
        let self = this;
        if(!self.store.all){
            let arr = self.store.ids?self.store.ids.split(','):[],
                _arr = ids?ids.split(','):[],
                __arr = [];
            arr.forEach((v,i)=>{
                if(!_arr.includes(v))
                    __arr.push(v)
            })
            self.store.ids = __arr.join(',');
            store.set(self.config.name,self.store)
        }
    }
}
export default HandleCheckbox;
