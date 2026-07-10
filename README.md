<h1 align="center">LedCover</h1>

<p align="center">
  <strong>Self-hosted AI cover editor for WeChat and Xiaohongshu</strong><br>
  自托管双平台智能封面编辑器
</p>

<p align="center">
  微信公众号 & 小红书 | 可复用模板 | 多模型 Provider | PNG 导出
</p>

<p align="center">
  <img alt="GitHub version" src="https://img.shields.io/badge/version-2.0.0-purple">
  <a href="https://github.com/LabDogX/LedCover/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-green"></a>
  <img alt="AI Providers" src="https://img.shields.io/badge/AI-Gemini%20%7C%20DeepSeek%20%7C%20OpenAI-blue">
</p>

---

## 📖 关于本项目

**LedCover** 是一个面向微信公众号和小红书封面的自托管 AI 封面编辑器。它保留纯前端架构，支持本地部署、可复用模板、二次编辑、多模型 provider 和高清 PNG 导出。

本项目基于 **[RongCover](https://github.com/zjr3193/RongCover)** 和 **[Gudong Cover 咕咚封面](https://github.com/maoruibin/GudongCover)** 继续维护，作为长期独立项目演进。项目会继续兼顾微信公众号横版封面和小红书 3:4 竖版封面，不只服务单一平台。

**原作者**: [咕咚 (Gudong)](https://github.com/maoruibin)
**Rong Cover 版本维护**: [荣书福 (阿荣)](https://github.com/rongshufu) / [zjr3193](https://github.com/zjr3193)
**LedCover 独立维护**: [LabDogX](https://github.com/LabDogX)

### 新增功能 ✨

- 🎨 **二次编辑功能** - AI 生成后可继续调整封面
  - 文字内容编辑（标题、副标题、标签）
  - 字体颜色自定义
  - 字体选择与临时上传字体
  - 文字对齐方式（左/中/右）
  - 背景设置（纯色/渐变/图片）
  - 图片背景调整（位置、缩放、模糊、遮罩）
- 🧩 **模板和配色预设** - 面向微信公众号和小红书的可复用封面模板
- 🤖 **多模型 Provider** - 支持 Gemini、DeepSeek、OpenAI、LM Studio、Ollama 和自定义 OpenAI-compatible 接口

感谢所有作者和贡献者开源了这个优秀的项目！🙏

---

## ✨ 核心特性

- **🤖 智能文案提炼** — 无论你输入多长的一段话，AI 自动提炼核心主标题和副标题
- **✏️ 二次编辑** — AI 生成后可继续精细调整，完美控制每个细节
- **🔤 字体控制** — 支持标题、副标题、标签选择字体，也可临时上传本地字体测试效果
- **🎨 双模式切换** — 针对不同平台优化：
  - **公众号模式 (2.35:1)**：极简、深色、强调效率与专业感
  - **小红书模式 (3:4)**：高饱和、大字报、强调情绪与点击欲
- **⚡️ 多模型生成** — 支持 Gemini、DeepSeek、OpenAI 以及本地 LM Studio/Ollama 兼容接口
- **🔗 URL 联动** — 支持通过 URL 参数自动填充标题，方便集成到其他工具
- **💾 一键导出** — 自动生成高分辨率 PNG 图片，即下即用

---

## 🛠️ 技术栈

- **Framework**: [React 19](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Model**: Google Gemini / DeepSeek / OpenAI / OpenAI-compatible local endpoints
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Export**: [modern-screenshot](https://github.com/chenngng/modern-screenshot)

---

## 📦 快速开始

### 前置要求

你可以选择任一模型提供商：
- [Google AI Studio](https://aistudio.google.com/) (Gemini)
- [DeepSeek Platform](https://platform.deepseek.com/) (DeepSeek)
- [OpenAI Platform](https://platform.openai.com/) (OpenAI)
- 本地 [LM Studio](https://lmstudio.ai/) 或 [Ollama](https://ollama.com/) 暴露的 OpenAI-compatible 接口

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/LabDogX/LedCover.git
   cd LedCover
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **准备 API Key**

   为避免把 API Key 写入前端构建产物，项目不再从 Vite/Docker 构建环境读取 Key。启动应用后，在右上角设置中选择 provider、模型名、Base URL，并输入 API Key。Key 会保存在当前浏览器的 localStorage 中。

   LM Studio 默认 Base URL 为 `http://localhost:1234/v1`，Ollama 默认 Base URL 为 `http://localhost:11434/v1`。本地接口通常不需要 API Key，但需要在本地服务侧允许浏览器跨域访问。

4. **启动项目**
   ```bash
   npm run dev
   ```

5. **打开浏览器**
   ```
   http://localhost:5173
   ```

---

## 🐳 Docker 部署

LedCover 支持 Docker 和 Docker Compose 部署，方便快速上线。

### 使用 Docker Compose（推荐）

1. **确保已安装 Docker 和 Docker Compose**

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   ```
   http://localhost:7211
   ```

4. **停止服务**
   ```bash
   docker-compose down
   ```

### 使用 Docker 命令

1. **构建镜像**
   ```bash
   docker build -t led-cover:latest .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 7211:80 --name led-cover led-cover:latest
   ```

3. **访问应用**
   ```
   http://localhost:7211
   ```

4. **停止并删除容器**
   ```bash
   docker stop led-cover
   docker rm led-cover
   ```

### 配置 API Key

Docker 部署时，请启动后访问应用，点击右上角设置按钮，在设置界面中选择 provider、模型名、Base URL，并输入 API Key（会保存在当前浏览器 localStorage 中）。

请不要把 API Key 写入 Docker Compose、Vite `.env` 或镜像构建参数；纯前端构建产物对访问者可见，构建期注入的 Key 会暴露在浏览器端 JavaScript 中。

### 配置字体

编辑封面时可以直接在文字面板中选择系统字体，或上传 `.ttf`、`.otf`、`.woff`、`.woff2` 字体文件进行当前页面测试。上传字体只保存在当前浏览器页面会话中，不会写入数据库，也不会进入构建产物。

如果要把可免费商用字体随项目一起发布，建议只放精选字体：

1. 将字体文件放入 `public/assets/fonts/`
2. 在 `utils/fonts.ts` 的 `PROJECT_FONT_OPTIONS` 中登记字体名称、CSS font-family 和文件路径
3. 重新运行 TypeScript 检查和生产构建

`public/fonts` 已配置忽略规则，避免误把完整字体库提交进仓库。完整字体包建议放在项目外，需要试用时用编辑器里的“上传字体”按钮临时加载。

### 生产环境部署

对于生产环境，建议：

1. **使用反向代理**（如 Nginx、Traefik）
2. **配置 HTTPS**（通过 Let's Encrypt）
3. **设置资源限制**

示例 docker-compose.yml 生产配置：
```yaml
version: '3.8'

services:
  led-cover:
    build: .
    container_name: led-cover
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    environment:
      - TZ=Asia/Shanghai
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.led-cover.rule=Host(`cover.yourdomain.com`)"
      - "traefik.http.routers.led-cover.tls=true"
      - "traefik.http.routers.led-cover.tls.certresolver=letsencrypt"
```

---

## 🔌 集成指南

LedCover 支持通过 URL 参数预填充内容，方便与其他编辑器或工作流集成。

**参数格式：**
```
http://localhost:5173/?title=您的文章标题
```

**示例：**
```
http://localhost:5173/?title=如何使用React构建应用
```

---

## 🤝 致谢

感谢所有作者和贡献者在这个项目链条上的工作：

- **[咕咚 (Gudong)](https://github.com/maoruibin)**：原始项目作者，开发并开源了 [Gudong Cover](https://github.com/maoruibin/GudongCover)。
- **ruibin3**：历史提交作者，参与了原始项目演进。
- **[荣书福 (阿荣)](https://github.com/rongshufu) / [zjr3193](https://github.com/zjr3193)**：Rong Cover 版本维护与二次编辑功能增强。
- **[LabDogX](https://github.com/LabDogX)**：LedCover 独立维护者，推进自托管双平台封面工具方向，包括模板、配色、Emoji、移动端编辑和多模型 provider 支持。

原项目地址：https://github.com/maoruibin/GudongCover  
RongCover 上游地址：https://github.com/zjr3193/RongCover

---

## 📄 开源协议

[MIT License](LICENSE)

LedCover 基于 [RongCover](https://github.com/zjr3193/RongCover) 和 [Gudong Cover](https://github.com/maoruibin/GudongCover) 修改，遵循 MIT 协议。请保留原项目来源、作者致谢和本许可证说明。

项目来源和作者归属也记录在 [NOTICE.md](NOTICE.md)。

---

> **Make your ideas visible.**
>
> 让观点被看见。
