# PixelShrink · 纯前端图片压缩工具

> 带粉丝一起做的小项目 — 浏览器本地压缩，图片不上传服务器，部署在 GitHub Pages。

## 在线演示

部署后访问：`https://xqnode.github.io/image-compressor/`

## 功能

- 拖拽 / 点击上传图片
- 实时调节压缩质量、最大宽度
- 支持输出 JPEG / WebP / PNG
- 原图 vs 压缩图对比滑块
- 显示体积节省百分比
- 一键下载

## 技术栈

| 部分 | 方案 |
|------|------|
| 压缩引擎 | Canvas API（浏览器原生） |
| 框架 | 无，纯 HTML + CSS + JS |
| 部署 | GitHub Pages |

**为什么不用后端？** 图片压缩完全可以在浏览器完成，更安全、更便宜、更适合 GitHub Pages 静态托管。

## 项目结构（适合录教程）

```
image-compressor/
├── index.html          # 页面结构
├── css/
│   └── style.css       # 样式
├── js/
│   ├── compressor.js   # 压缩核心逻辑（教程重点讲这个）
│   └── app.js          # UI 交互
└── .github/workflows/
    └── deploy.yml      # 自动部署
```

## 本地运行

**可以直接双击 `index.html` 打开使用**，无需安装任何环境。

如果要用本地服务器（录课演示时可选）：

```bash
# 方式 1：Python
python -m http.server 8080

# 方式 2：Node.js
npx serve .
```

浏览器打开 `http://localhost:8080`

## 部署到 GitHub Pages

### 第一步：创建仓库并推送

```bash
git init
git add .
git commit -m "feat: 纯前端图片压缩工具"
git branch -M main
git remote add origin https://github.com/<你的用户名>/image-compressor.git
git push -u origin main
```

### 第二步：开启 GitHub Pages

1. 进入仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送代码后，`.github/workflows/deploy.yml` 会自动部署
4. 约 1–2 分钟后访问 `https://<你的用户名>.github.io/image-compressor/`

### 手动部署（不用 Actions）

1. Settings → Pages → Source 选 **Deploy from a branch**
2. Branch 选 `main`，文件夹选 `/ (root)`
3. Save

## 视频教程建议大纲（B站）

| 章节 | 内容 | 时长 |
|------|------|------|
| 1. 效果演示 | 拖图 → 对比 → 下载，展示 GitHub Pages 链接 | 2 min |
| 2. 技术选型 | 为什么纯前端、Canvas 原理 | 3 min |
| 3. 写 HTML 结构 | 上传区 + 工作台布局 | 5 min |
| 4. 压缩核心 | 讲 `compressor.js`，Canvas drawImage + toBlob | 10 min |
| 5. UI 交互 | 拖拽上传、滑块防抖、对比组件 | 10 min |
| 6. 样式美化 | CSS 变量、暗色主题 | 5 min |
| 7. 部署上线 | push → GitHub Pages → 浏览器访问 | 5 min |
| 8. 粉丝互动 | 号召 Fork、提 Issue、下集预告 | 2 min |

## 下集可以做的功能（粉丝投票）

- [ ] 批量压缩 + ZIP 打包下载
- [ ] PWA 离线使用
- [ ] 自定义域名
- [ ] 压缩历史记录（IndexedDB）
- [ ] 更多格式（AVIF）

## License

MIT
