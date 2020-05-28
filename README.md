### About

[vue-castle](https://github.com/KevinMint55/vue-castle)前端项目的后台服务，实现实时共享编辑表格的后台服务。

[Demo](https://castle.willwuwei.com/)

相关项目：[vue-willtable](https://github.com/KevinMint55/vue-willtable)

资源服务与[七牛云](https://www.qiniu.com/)对接，采用其CDN加速

### 技术栈

Nodejs + Koa2 + mongodb + mongoose + socket.io

### 开发指南

``` bash
# 安装依赖
npm install / yarn

# 开发模式
npm run dev / yarn dev

# 启动服务
npm start / yarn start
```

> 注意：默认使用config/index.js为配置文件，在根目录新建config.js将优先使用

### 项目目录结构

```
  node-castle                        # 项目名称
  │
  ├── app                            # 应用
  │   ├── middlewares                # 中间件
  │   ├── models                     # 模型
  │   ├── routers                    # 路由
  │   └── utils                      # 工具方法
  │
  ├── assets                         # 临时图片生成地址
  │
  ├── config                         
  │   └── index.js                   # 配置文件
  │
  ├── .editorconfig                  # 编辑器配置文件
  ├── .eslintrc.js                   # eslint配置文件
  ├── .gitignore                     # git文件忽略
  ├── .jsbeautifyrc                  # js文件格式化配置文件
  ├── app.js                         # 入口启动文件
  ├── package.json                   # 项目依赖配置
  ├── READMEAD.md                    # 开发说明
  └── yarn.lock                      # 依赖版本锁

```