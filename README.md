# YIOne 浏览器本地版

本目录从现有 48 页交互原型起步。GitHub Pages 部署使用纯前端模式。

纯前端模式不使用服务端和数据库。原型功能在当前浏览器运行。浏览器本地数据不会在设备之间同步。

产品架构与验收边界见 [docs/architecture.md](docs/architecture.md)。原型来源位于 `/Users/honk/Desktop/最近项目/yione/yione-route-workbench`。

## 本地预览

```bash
npm ci
npm run dev
```

打开 `http://127.0.0.1:5173/` 使用浏览器本地版。

## GitHub Pages

运行 `npm run build:pages` 生成纯前端的 `dist/` 文件夹。

仓库中的 `.github/workflows/pages.yml` 会在默认分支更新后自动发布。

首次发布时，在 GitHub 仓库的 Settings → Pages 中选择 GitHub Actions 作为来源。

构建会按仓库名称设置资源路径。`404.html` 用于恢复页面直达链接。

纯前端版适合展示和单设备操作。多用户共享聊天、跨设备同步和真实支付无法由 GitHub Pages 单独完成。

仓库只发布前端代码。构建产物不会包含本地实验性的服务端代码。
