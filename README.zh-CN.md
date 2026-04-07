<div align="center">

# ResumeLab

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-black)
![Hono](https://img.shields.io/badge/Hono-API-orange)
![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-F69220)

简体中文 | [English](./README.md)

</div>

ResumeLab 是一个强调效率、清晰表达与编辑体验的现代化简历工具，帮助你更轻松地完成简历撰写、润色、预览与导出。

本项目基于 [Magic Resume](https://github.com/JOYCEQL/magic-resume) fork。当前仓库已经重构为前后端分离的 monorepo，并引入独立的 Hono API 后端来承载 AI 相关能力。

## Fork 说明

本项目 fork 自 [Magic Resume](https://github.com/JOYCEQL/magic-resume)。
原项目的许可证以及 [LICENSE](LICENSE) 中的附加商业限制，仍适用于上游代码部分。

## 项目截图

<img width="1920" height="1440" alt="ResumeLab Screenshot" src="https://github.com/user-attachments/assets/4667e49a-7bf2-4379-9390-725e42799dc7" />

## 特性

- 🚀 基于 TanStack Start 构建
- 💫 流畅的动画效果 (Framer Motion)
- 🎨 自定义主题支持
- 📱 响应式设计
- 🌙 深色模式
- 📤 导出为 PDF
- 🔄 实时预览
- 💾 自动保存
- 🔒 本地存储

## 技术栈

- `apps/web`：TanStack Start、Vite、React、TypeScript、Tailwind CSS、Zustand、TipTap
- `apps/backend`：Hono、Node.js、TypeScript
- 工作区管理：pnpm

## 项目结构

```text
.
├── apps
│   ├── web        # 前端应用
│   └── backend    # Hono API 服务
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## 快速开始

1. 克隆项目

```bash
git clone git@github.com:1111-stu/resume-lab.git
cd resume-lab
```

2. 安装依赖

```bash
pnpm install
```

3. 准备环境变量文件

```bash
cp apps/web/.env.example apps/web/.env
cp apps/backend/.env.example apps/backend/.env
```

4. 同时启动前后端

```bash
pnpm dev
```

5. 访问地址

- 前端：`http://localhost:5137`
- 后端：`http://localhost:3000`

## 开发命令

同时启动前后端：

```bash
pnpm dev
```

只启动前端：

```bash
pnpm dev:web
```

只启动后端：

```bash
pnpm dev:backend
```

当前这个命令只会构建前端。

## 环境变量

前端 `apps/web/.env.example`：

```bash
VITE_API_BASE_URL=http://localhost:3000
FONTCONFIG_PATH=/var/task/fonts
```

后端 `apps/backend/.env.example`：

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5137
```

说明：

- 前端通过运行时配置 `VITE_API_BASE_URL` 调用独立后端。
- AI 模型相关凭证目前由前端设置页配置，并在需要时透传给后端接口。

## API 概览

当前后端已包含这些核心接口：

- `GET /health`
- `POST /v1/resume/grammar`
- `POST /v1/resume/polish`
- `POST /v1/resume/import`
- `GET /v1/media/image-proxy`

其中语法检查链路，是当前这套前后端拆分架构下第一条完整跑通的示范能力。

## 项目方向

ResumeLab 会继续保持开源，并持续迭代。
下一阶段会重点围绕简历编辑体验优化，以及更多 AI 能力扩展，例如面试题预测、简历扩写、自我介绍生成等。

## 部署说明

当前架构更推荐前后端分开部署：

- `apps/web` 作为前端服务部署
- `apps/backend` 作为 API 服务部署

两个子应用都已经有各自独立的 Dockerfile：

- `apps/web/Dockerfile`
- `apps/backend/Dockerfile`

如果是本地联调或简单自托管，也可以直接使用 Docker Compose：

```bash
docker compose up -d
```

默认端口：

- Web：`5137`
- Backend：`3000`

## 开源协议与商业授权

本项目源代码基于 **Apache 2.0** 协议开源，但附带**严格的商业使用限制**：

- **个人免费**：仅限个人非商业目的免费使用。
- **商用需授权**：若你将其作为服务对外提供、用于商业运营，或进行二次商业化开发，均需要获得商业授权。

详细条款请查看 [LICENSE](LICENSE)。

## 路线图

- [x] AI 辅助编写
- [x] 多语言支持
- [x] 自定义模型配置
- [x] 自动一页纸
- [ ] 简历诊断
- [ ] 面试题预测
- [ ] 简历扩写
- [ ] 自我介绍生成
- [ ] 更多简历模板
- [ ] 更多导出格式
- [ ] 导入 PDF / Markdown / 更多格式
- [ ] 在线简历托管

## Star History

<a href="https://star-history.com/#1111-stu/resume-lab&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
 </picture>
</a>

## 支持项目

如果 ResumeLab 对你有帮助，欢迎点一个 Star。
