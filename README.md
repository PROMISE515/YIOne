# YIOne 浏览器本地版

本目录从现有 48 页交互原型起步。GitHub Pages 部署使用纯前端模式。

纯前端模式不使用服务端和数据库。原型功能在当前浏览器运行。浏览器本地数据不会在设备之间同步。

项目保留 48 页交互原型，并使用浏览器本地状态运行。

## 本地预览

```bash
npm ci
npm run dev
```

打开 `http://127.0.0.1:5173/` 使用浏览器本地版。

## GitHub Pages

运行 `npm run build:pages` 生成纯前端的 `dist/` 文件夹。

私有源码仓库是 [PROMISE515/YIOne](https://github.com/PROMISE515/YIOne)。

公开部署仓库是 [PROMISE515/YIOne-pages](https://github.com/PROMISE515/YIOne-pages)。

网站地址是 <https://promise515.github.io/YIOne-pages/>。

源码仓库的工作流会构建并保存网页文件。更新网站时，需要将构建文件同步到公开部署仓库。

公开部署仓库的 Pages 来源为 `main` 分支根目录。

构建会按仓库名称设置资源路径。`404.html` 用于恢复页面直达链接。

纯前端版适合展示和单设备操作。多用户共享聊天、跨设备同步和真实支付无法由 GitHub Pages 单独完成。

仓库只发布前端代码。构建产物不会包含本地实验性的服务端代码。
