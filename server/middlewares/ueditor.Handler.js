/**
 * @Author: Jet.Chan
 * @Date:   2017-03-02T16:55:50+08:00
 * @Email:  guanjie.chen@talebase.com
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-03T13:31:36+08:00
 */



/**
 * Created by weijianli on 16/1/26.
 */
"use strict";
var path = require("path");
var fs = require('fs');
var thunkify = require('thunkify');
var parse = require('co-busboy');
var static_path = path.join(process.cwd(), 'public');
var img_type = '.jpg .png .gif .ico .bmp .jpeg';
var img_path = '/ueditor/upload/img';
var files_path = '/ueditor/upload/file';

function* ueditor(next) {

    if (this.query.action === 'config') {
        this.set("Content-Type", "json");
        this.redirect("/ueditor/nodejs/config.json");
    } else if (this.query.action === 'listimage') {
        this.body = yield ue_pic_list(img_path, this.query.start, this.query.size);
    } else if (this.query.action === 'listfile') {
        this.body = yield ue_pic_list(files_path, this.query.start, this.query.size);
    } else if ((this.query.action === 'uploadimage' || this.query.action === 'uploadfile') && this.request.fields) {
        try {

            this.set("Content-Type", "text/html;charset=utf-8");
            var file = this.request.fields.upfile,
                tmpath, newpath, filename, tmp_name;
            if (file && file.length > 0) {
                if (file[0].size > 1024 * 300) {
                    this.body = JSON.stringify({
                        state: '上传错误：插入的图片每张不能大于300KB'
                    })
                    return;
                }

                tmpath = file[0].path;
                tmp_name = file[0].name;
                filename = 'pic_' + (new Date()).getTime() + '_' + file[0].name;
                newpath = path.join(static_path, img_path, filename);
                console.log('tmpath', tmpath);
                console.log('newpath', newpath);
                var stream = fs.createWriteStream(newpath); //创建一个可写流
                fs.createReadStream(tmpath).pipe(stream); //可读流通过管道写入可写流
            }
            this.body = JSON.stringify({
                'url': `http://${path.join(this.host, img_path, filename)}`,
                'title': filename,
                'original': tmp_name,
                'state': 'SUCCESS'
            })
        } catch (e) {
            this.body = JSON.stringify({
                state: e.message
            })
        }
    } else {
        this.body = JSON.stringify({
            'state': 'FAIL'
        });
    }
    yield next;
}


function* ue_pic_list(list_dir, start, size) {
    var list = [];
    var files = yield thunkify(fs.readdir)(path.join(static_path, list_dir));
    for (var i in files) {
        if (i >= start && i < (parseInt(start) + parseInt(size))) {
            var file = files[i];
            //if(file_type.indexOf(path.extname(file)) >= 0 ){
            list.push({
                url: path.join('/', list_dir, file)
            });
            //}
        }
    }
    return {
        "state": "SUCCESS",
        "list": list,
        "start": start,
        "total": files.length
    }
}

module.exports = function(staticPath) {
    if (staticPath) {
        static_path = path.join(process.cwd(), staticPath);
    }
    return ueditor;
};
