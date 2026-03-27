# Chronicle Cloud

个人生活追踪应用，数据通过 GitHub Gist 云端同步。

## 功能

- 📅 日历视图 + 时间线视图
- ✅ 任务/习惯追踪
- ☁️ 云端同步（GitHub Gist）
- 🌙 深色模式
- 📊 数据统计

## 部署到 Vercel

### 1. 准备 GitHub Token

1. 打开 [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. 点 **Generate new token (classic)**
3. 勾选 **gist** 权限
4. 生成并复制 token（只显示一次，先存好）

### 2. 推送到 GitHub

```bash
# 初始化仓库
cd chronicle-cloud
git init
git add .
git commit -m "init chronicle cloud"

# 关联你的 GitHub 仓库（先在 GitHub 上创建空仓库）
git remote add origin https://github.com/你的用户名/chronicle-cloud.git
git branch -M main
git push -u origin main
```

### 3. 部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点 **Add New...** → **Project**
3. 选择刚推的 `chronicle-cloud` 仓库，点 **Import**
4. Framework Preset 选 **Other**（默认即可）
5. **Environment Variables** 添加：
   - Name: `GITHUB_TOKEN`
   - Value: 你刚才生成的 token
6. 点 **Deploy**
7. 等待约 30 秒，部署完成 🎉

### 4. 使用

1. 打开分配的域名（如 `chronicle-cloud.vercel.app`）
2. 点右上角 🔗 按钮绑定云端
3. 点 ☁️ 按钮手动同步

## 本地开发

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 本地开发
vercel dev

# 设置环境变量
vercel env add GITHUB_TOKEN
```

## 项目结构

```
├── index.html        # 前端单页应用
├── api/
│   ├── gist-read.js  # GET  /api/gist-read  — 读取云端数据
│   ├── gist-write.js # POST /api/gist-write — 写入云端数据
│   └── gist-init.js  # POST /api/gist-init  — 创建新的 Gist
├── vercel.json       # Vercel 配置
└── .gitignore
```
