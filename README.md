<div align="center">

# ✨ ResumeLab ✨

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.0-purple)

[简体中文](./README.zh-CN.md) | English

</div>

ResumeLab is a fork of [Magic Resume](https://github.com/JOYCEQL/magic-resume), a modern online resume editor that makes creating professional resumes simple and enjoyable. Built with TanStack Start and Framer Motion, it supports real-time preview and custom themes.

## Fork Notice

This project is forked from [Magic Resume](https://github.com/JOYCEQL/magic-resume).
The original project's license and additional commercial restrictions in [LICENSE](LICENSE) continue to apply to the upstream codebase.

## 📸 Screenshots

<img width="1920" height="1440" alt="336_1x_shots_so" src="https://github.com/user-attachments/assets/18969a17-06f8-4a4b-94eb-284ba8442620" />


## ✨ Features

- 🚀 Built with TanStack Start
- 💫 Smooth animations (Framer Motion)
- 🎨 Custom theme support
- 📱 Responsive design
- 🌙 Dark mode
- 📤 Export to PDF
- 🔄 Real-time preview
- 💾 Auto-save
- 🔒 Local storage

## 🛠️ Tech Stack

- TanStack Start
- TypeScript
- Motion
- Tiptap
- Tailwind CSS
- Zustand
- Shadcn/ui
- Lucide Icons

## 🚀 Quick Start

1. Clone the project

```bash
git clone git@github.com:1111-stu/resume-lab.git
cd resume-lab
```

2. Install dependencies

```bash
pnpm install
```

3. Start development server

```bash
pnpm dev
```

4. Open browser and visit `http://localhost:3000`

## Local Split Dev

To run the frontend against the extracted Hono backend:

1. Create a local env file from `apps/web/.env.example` and set:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

2. Start the backend:

```bash
pnpm dev:backend
```

3. Start the frontend in another terminal:

```bash
pnpm dev
```

Current migration demo:

- Grammar check is the first frontend feature wired to the standalone backend.
- Frontend request target: `/v1/resume/grammar`
- Backend service default address: `http://localhost:3001`

## 📦 Build and Deploy

```bash
pnpm build
```


## 🐳 Docker Deployment

### Docker Compose

1. Ensure you have Docker and Docker Compose installed

2. Run the following command in the project root directory:

```bash
docker compose up -d
```

This will:

- Automatically build the application image
- Start the container in the background


## 📝 License and Commercial Use

The source code of this project is open-sourced under the **Apache 2.0** license, but with **strict commercial use restrictions**:

- **Free for Personal Use**: Free to use purely for personal, non-commercial purposes (e.g., personal learning, creating your own resume).
- **Commercial License Required**: Unauthorized commercial use is strictly prohibited. Any organization or individual that provides it as a service (SaaS/PaaS, etc.) to the public for profit, uses it for enterprise commercial operations, or conducts secondary commercial development, **must obtain a commercial license, regardless of whether the source code has been modified**.

Please see the [LICENSE](LICENSE) file for detailed terms.

## 🗺️ Roadmap

- [x] AI-assisted writing
- [x] Multi-language support
- [ ] Support for more resume templates
- [ ] Support for more export formats
- [ ] Import PDF, Markdown, etc.
- [x] Custom model
- [x] Auto one page
- [ ] Online resume hosting

## 📈 Star History

<a href="https://star-history.com/#1111-stu/resume-lab&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=1111-stu/resume-lab&type=Date" />
 </picture>
</a>

## 🌟 Support

If you find this project helpful, please give it a star ⭐️
