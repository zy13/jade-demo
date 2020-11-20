<!--
@Author: Jet.Chan
@Date:   2016-11-11T11:24:29+08:00
@Email:  guanjie.chen@talebase.com
@Last modified by:   Jet.Chan
@Last modified time: 2016-12-21T11:54:34+08:00
-->



## 前后端分离框架
      5.0 考试系统

      技术点：
        项目环境- node.js
        Web Framework- koa2
        模版引擎- jade , juicer
        css框架- less
        第三方框架- cui , babel ...
        语法版本- es6 为主 ,  es5 为次
        构建工具- webpack , gulp
        版本管理和发布- git & pm2

### 项目依赖 安装 与 更新
      安装  node.js | LTS 稳定版本

      cd 入项目根目录 执行一下命令

      npm install //安装项目依赖的包
      npm install nodemon -g  //安装全局监听服务器库
      npm update //需要时候才更新 依赖包


### 项目启动
      npm run start:main
      npm run start:static

      服务端端口 ： 3000
      客户端端口 ： 9001

      访问入口
      http://localhost:3000/customer/home

### 项目说明
      MDZZ , QNMLGB

      项目目录

        |-build - 构建任务层
        |-config - 项目配置
        |-doc    - 项目文档
        |-public - 公共可访问库
        |-server - 后端服务层
        |-src    - 前端静态资源
