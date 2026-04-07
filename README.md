<div align="center">

# ResumeLab

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-black)
![Hono](https://img.shields.io/badge/Hono-API-orange)
![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-F69220)

[简体中文](./README.zh-CN.md) | English

</div>

ResumeLab is a modern resume builder focused on speed, clarity, and a polished editing experience. It helps you write, refine, preview, and export professional resumes with less friction.

This project is forked from [Magic Resume](https://github.com/JOYCEQL/magic-resume) and is now organized as a frontend/backend separated monorepo, with a standalone Hono API backend for AI-powered capabilities.

## Fork Notice

This project is forked from [Magic Resume](https://github.com/JOYCEQL/magic-resume).
The original project's license and additional commercial restrictions in [LICENSE](LICENSE) continue to apply to the upstream codebase.

## Screenshots

<img width="1920" height="1440" alt="ResumeLab Screenshot" src="https://github.com/user-attachments/assets/18969a17-06f8-4a4b-94eb-284ba8442620" />

## Features

- 🚀 Built with TanStack Start
- 💫 Smooth animations (Framer Motion)
- 🎨 Custom theme support
- 📱 Responsive design
- 🌙 Dark mode
- 📤 Export to PDF
- 🔄 Real-time preview
- 💾 Auto-save
- 🔒 Local storage

## Tech Stack

- `apps/web`: TanStack Start, Vite, React, TypeScript, Tailwind CSS, Zustand, TipTap
- `apps/backend`: Hono, Node.js, TypeScript
- Workspace: pnpm

## Project Structure

```text
.
├── apps
│   ├── web        # frontend app
│   └── backend    # Hono API service
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## Quick Start

1. Clone the project

```bash
git clone git@github.com:1111-stu/resume-lab.git
cd resume-lab
```

2. Install dependencies

```bash
pnpm install
```

3. Prepare env files

```bash
cp apps/web/.env.example apps/web/.env
cp apps/backend/.env.example apps/backend/.env
```

4. Start both apps

```bash
pnpm dev
```

5. Open:

- Frontend: `http://localhost:5137`
- Backend: `http://localhost:3000`

## Development Commands

Run both apps:

```bash
pnpm dev
```

Run frontend only:

```bash
pnpm dev:web
```

Run backend only:

```bash
pnpm dev:backend
```

This currently builds the frontend only.

## Environment Variables

Frontend `apps/web/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000
FONTCONFIG_PATH=/var/task/fonts
```

Backend `apps/backend/.env.example`:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5137
```

Notes:

- The frontend reads `VITE_API_BASE_URL` at runtime to call the standalone backend.
- AI provider credentials are currently configured in the frontend settings and sent to backend API routes when needed.

## API Overview

Current backend routes include:

- `GET /health`
- `POST /v1/resume/grammar`
- `POST /v1/resume/polish`
- `POST /v1/resume/import`
- `GET /v1/media/image-proxy`

The grammar check flow is the first fully migrated frontend-to-backend example in this architecture.

## Project Direction

ResumeLab will continue to be maintained as an open-source project.
The next stage will focus on improving the resume editing experience and expanding AI-assisted features, including interview question prediction, resume expansion, and self-introduction generation.

## Deployment

This project is designed for separated deployment:

- `apps/web` can be deployed as the frontend service
- `apps/backend` can be deployed as the API service

Each app has its own Dockerfile:

- `apps/web/Dockerfile`
- `apps/backend/Dockerfile`

For local or simple self-hosting, you can also use Docker Compose:

```bash
docker compose up -d
```

Default ports:

- Web: `5137`
- Backend: `3000`

## License and Commercial Use

The source code of this project is open-sourced under the **Apache 2.0** license, but with **strict commercial use restrictions**:

- **Free for Personal Use**: Free to use purely for personal, non-commercial purposes.
- **Commercial License Required**: Unauthorized commercial use is prohibited. If you provide it as a service, use it in commercial operations, or perform secondary commercial development, you must obtain commercial authorization.

Please read [LICENSE](LICENSE) for the detailed terms.

## Roadmap

- [x] AI-assisted writing
- [x] Multi-language support
- [x] Custom model configuration
- [x] Auto one page
- [ ] Resume diagnosis
- [ ] Interview question prediction
- [ ] Resume expansion
- [ ] Self-introduction generation
- [ ] More resume templates
- [ ] More export formats
- [ ] Import PDF / Markdown / more formats
- [ ] Online resume hosting

## Star History

<a href="https://star-history.com/#1111-stu/resume-lab&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
 </picture>
</a>

## Support

If ResumeLab helps you, a star is always appreciated.
