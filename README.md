# 考研错题本 App

考研错题整理与复习工具 — 支持拍照识别、智能分类、账号登录、云端存储。

---

## 🚀 在线体验（部署后才能用）

- **前端**：部署到 Vercel 后的域名
- **后端 API**：部署到 Railway 后的域名

> 部署方法看下方步骤。

---

## 📦 本地开发

```bash
# 安装所有依赖
npm install
cd server && npm install && cd ..

# 终端1: 启动后端 (端口 3001)
cd server && npx tsx src/index.ts

# 终端2: 启动前端 (端口 5173)
npm run dev
```

打开 http://localhost:5173

---

## ☁️ 部署到云端（免费，只需3步）

需要注册：**GitHub → Railway → Vercel**，全程约 10 分钟。

### 第 1 步：将代码推送到 GitHub

```bash
# 在项目目录下执行
git init
git add .
git commit -m "🎉 考研错题本初始版本"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

### 第 2 步：部署后端到 Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. 打开 https://railway.app 注册账号
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你刚推送的仓库
4. **关键**：在 Railway 项目设置中，添加环境变量：
   - `JWT_SECRET` = 任意复杂字符串（如 `your-secret-key-123456`）
5. Railway 部署成功后，点击项目 → **Settings** → **Generate Domain**
6. 复制生成的域名（类似 `xxx.up.railway.app`）

### 第 3 步：部署前端到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 打开 https://vercel.com 注册（用 GitHub 登录）
2. 点击 **Add New** → **Project** → 选择你的仓库
3. 点击 **Environment Variables** 添加：
   - `VITE_API_URL` = `https://你的railway域名`（不要加末尾斜杠）
4. 点击 **Deploy**，等待部署完成

### ✅ 完成！

打开你的 Vercel 域名，注册账号，就可以用了！

你和朋友各自注册账号，错题数据存储在云端，互不干扰。

---

## 📱 安装 Android App

### 方式 1：PWA 安装（最简单，推荐）

用手机 Chrome 打开你的 Vercel 域名 → 点右上角三个点 → **添加到主屏幕**

### 方式 2：下载 APK（原生 App）

1. 打开你的 GitHub 仓库 → 点击 **Actions** 标签
2. 左侧选择 **Build Android APK** → 点击 **Run workflow**
3. 等几分钟，构建完成后下载生成的 APK 文件
4. 把 APK 传到手机安装即可

---

## 🧩 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS 4 |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT + bcrypt |
| 原生壳 | Capacitor (Android) |
| 部署 | Railway (后端) + Vercel (前端) |

## 📂 项目结构

```
├── server/              # 后端 API
│   └── src/
│       ├── index.ts     # Express 入口
│       ├── routes/      # 路由 (auth, mistakes, classify)
│       ├── controllers/ # 控制器
│       ├── middleware/   # JWT 认证中间件
│       └── db/          # SQLite 初始化
├── src/                 # 前端
│   ├── pages/           # 页面 (概览/列表/添加/详情/登录/注册)
│   ├── components/      # 组件 (智能上传/答案折叠/筛选)
│   ├── services/        # API 客户端 + 智能分类器
│   └── context/         # Auth 上下文
├── android/             # Capacitor 原生 Android 项目
├── public/              # PWA 图标
└── .github/workflows/   # 自动构建 APK
```
