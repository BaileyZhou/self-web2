# 🧠 Bailey 个人主页 —— 脑科学产品经理

一个以「脑科学 × 产品思维」为主题的个人作品集站点。首页采用**卡片翻页器（Card Pager）**交互：整屏卡片之间以淡入淡出过渡，支持滚轮 / 键盘 / 触摸 / 导航翻页；知识库与论文库为**文件驱动的 Markdown「CMS」**，新增内容只需新建一个 `.md` 文件；整体背景**按日期每日轮换主题**。

---

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Next.js 15（App Router）+ React 18.3 |
| 语言 | TypeScript 5.9（路径别名 `@/*` → `./src/*`） |
| 样式 | Tailwind CSS v3（`tailwind.config.js` 自定义动画/关键帧） |
| 内容解析 | `gray-matter`（frontmatter）+ `react-markdown` + `remark-gfm` |
| 图标 | `lucide-react` |
| 构建产物 | `output: 'export'` 静态导出 → `out/`，可部署任意静态托管 |

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 开发：http://localhost:3000
npm run build    # 静态构建：生成 out/
npm run start    # 预览构建产物（本地起静态服务）
```

> ⚠️ 开发期注意：**不要**在 `npm run dev` 运行的同时执行 `npm run build`（两者共用 `.next`，构建会损坏 dev 缓存导致随机 500）。如遇到，先停 dev，再 `rm -rf .next` 后重启。

---

## 目录结构

```
.
├── public/
│   ├── knowledge/*.md        # 📚 知识库内容（一个 .md = 一张知识卡片）
│   ├── papers/*.md           # 📄 论文/文献库内容（一个 .md = 一篇文献）
│   ├── code-examples/*.md    # 📦 代码案例内容（一个 .md = 一个业务流，含 GitHub 链接）
│   ├── resume/resume_zhoubin.pdf
│   └── knowledge/pic/        # 知识卡片封面图等静态资源
├── scripts/
│   ├── generate-resume.mjs   # 生成占位简历 PDF（node 直接运行）
│   └── strip-experience-items.mjs  # 一次性迁移脚本（旧版 experience 数据迁移）
├── src/
│   ├── app/                  # App Router 页面
│   │   ├── layout.tsx        # 根布局：Header / 滚动进度 / 每日主题背景
│   │   ├── page.tsx          # 首页：读取知识+论文，最新 N 条 → CardPager
│   │   ├── globals.css       # 全局样式（section-padding / stagger-in 动画等）
│   │   ├── knowledge/        # /knowledge 列表页 + /knowledge/[id] 详情页
│   │   ├── papers/           # /papers 文库页 + /papers/[id] 详情页
│   │   └── code-examples/    # /code-examples 代码案例列表页
│   ├── components/
│   │   ├── ui/               # 通用 UI：CardPager / Header / Footer / Section …
│   │   ├── sections/         # 首页各区块：Hero / About / Projects / Experience / Papers / CodeExamples + 插画
│   │   ├── knowledge/        # KnowledgeBrowser（知识库列表页交互）
│   │   ├── papers/           # PapersLibrary（论文文库交互）
│   │   └── code-examples/    # CodeExamplesLibrary（代码案例列表页交互）
│   └── lib/                  # 数据读取与工具（见下）
└── next.config.mjs / tailwind.config.js / tsconfig.json / package.json
```

`src/lib/` 一览：

| 文件 | 职责 |
| --- | --- |
| `data.ts` | 全站**配置数据**的唯一入口（导航 / Hero / 各区块文案与 `visibleCount` 等） |
| `knowledge.ts` | 读取 `public/knowledge/*.md`（**服务端专用**，`server-only` + fs + gray-matter） |
| `papers.ts` | 读取 `public/papers/*.md`（**服务端专用**，自动提取文献元数据） |
| `code-examples.ts` | 读取 `public/code-examples/*.md`（**服务端专用**，业务流 + GitHub 链接） |
| `knowledge-types.ts` / `papers-types.ts` / `code-examples-types.ts` | 客户端可安全引用的类型定义 |
| `pager.ts` | 卡片翻页器全局单例（供 Header / 进度点等跨树切换卡片） |
| `scroll.ts` | 平滑滚动工具（easeInOutCubic 缓动，尊重系统「减少动态」设置） |
| `daily-theme.ts` | 每日主题数据 + 取当天主题的纯函数 |

---

## 核心架构解读

### 1. 首页 = 卡片翻页器（`src/components/ui/CardPager.tsx`）

首页只渲染 `<CardPager />`，内部是 6 张整屏卡片：

```
hero → about → projects → experience(知识库) → papers(论文) → code-examples
```

关键设计：

- **懒挂载（lazy-mount）**：`mounted` 初始为 `[0]`（只挂载 Hero），进入某张卡片时才把它挂载。首屏 DOM 从约 1009 节点降到约 123 个，大幅缩短首屏可交互时间。
- **顺序淡入淡出**：切换时旧卡片先完全淡出（320ms），新卡片再淡入（420ms），两页**永不混叠**；切换期间用 `busyRef` 锁定输入。
- **动画性能优化**：非当前卡片加 `.pager-card-hidden` 类，暂停其内部所有 CSS 动画（否则 6 张卡片的漂浮/旋转/星星动画同时在跑，会卡顿/白屏）。
- 每张内容卡片底部**固定页脚**（`flex flex-col h-full` + `flex-1 overflow-y-auto`），滚动卡片内容时页脚保持在屏幕内。

```mermaid
flowchart LR
  Nav[导航 / 进度点 / Hero按钮] -->|pager.goTo(id)| Pager[lib/pager.ts 单例]
  Pager -->|注册的切换函数| CardPager[CardPager.goTo(index)]
  CardPager -->|setCurrentId| Hash[地址栏 hash 同步]
  CardPager -->|读 location.hash| Hash
  Hash -->|hashchange| CardPager
```

### 2. 全局翻页控制器（`src/lib/pager.ts`）

Header、右侧进度点、Hero 按钮**不在** CardPager 组件树内，通过这个单例跨树切换卡片：

- `register(fn)` / `unregister()`：CardPager 挂载时注册切换函数，卸载时注销（`isActive()` 判断是否在翻页环境）。
- `goTo(id)`：安全地调用注册函数；`setCurrentId(id)` 通知订阅者并同步地址栏 hash（`history.replaceState`）。
- `resetToHero()`：清除上次会话残留的 currentId 而不改 hash，修复「导航高亮知识库但显示首页」的失步 bug。
- 首页以「无 hash = hero、有 hash = 对应卡片」为基线，配合 `hashchange` 监听支持浏览器前进/后退与深链接（如 `/#papers`）。

### 3. 内容 = 文件驱动（Markdown CMS）

知识库与论文库**不写死在组件里**，而是扫描 `public/` 下的 `.md` 文件（文件名即 id），在**构建时**由服务端模块解析：

```mermaid
flowchart LR
  MD[public/knowledge|papers/*.md] -->|fs + gray-matter| Server[lib/knowledge|papers.ts 服务端]
  Server -->|props 传递| Pages[列表页 / 详情页 / 首页卡片]
  Pages -->|客户端组件接收| Client[KnowledgeBrowser / PapersLibrary / 卡片组件]
```

- **服务端/客户端边界**：`knowledge.ts`、`papers.ts` 使用 Node `fs`，加了 `server-only`，只能在 page 等服务端组件使用；客户端组件只通过 **props** 接收数据，类型从 `*-types.ts` 导入，避免把 `fs` 打进浏览器包。
- **首页取最新 N 条**：`page.tsx` 读取全部内容后 `.slice(0, visibleCount)` 传入 CardPager；`visibleCount` 在 `data.ts` 各区块配置里调整。

### 4. 三个页面层级

| 路由 | 文件 | 说明 |
| --- | --- | --- |
| `/` | `app/page.tsx` + `CardPager` | 首页翻页器；知识库/论文/代码案例展示最新 N 条卡片 |
| `/knowledge`、`/papers`、`/code-examples` | 服务端 wrapper → 客户端组件 | 完整文库/列表页 |
| `/knowledge/[id]`、`/papers/[id]` | 服务端详情页 | Markdown 正文 + 侧栏元信息 |

- **知识库列表页**（`KnowledgeBrowser`）：关键字检索 + 分类筛选 + 分页（每页 20 条），页脚固定。
- **论文文库**（`PapersLibrary`）：关键字检索 + 排序（最近加入/更新/年份/被引/评分/标题）+ **课题筛选（单选/多选开关）** + 阅读状态筛选 + 标准/紧凑视图 + 分页（每页 6 条）+ 右侧**悬浮详情面板**。
  - 课题筛选支持多选（OR 逻辑），卡片上的课题标签始终优先展示当前筛选的课题（稳定散列决定随机隐藏哪一个，避免重排闪烁）。
- **代码案例列表页**（`CodeExamplesLibrary`）：以**业务流**为单位，关键字检索 + 分页（每页 9 个）；每张业务流卡片展示 标签/标题/简介 + 子模块链接 + 主 GitHub 链接按钮。
- **列表页入场动画**：三个列表页卡片使用 `.stagger-in`（淡入上浮、逐张错开），分页切换时整组重放。

### 5. 每日主题背景（`DailyThemeBackground` + `daily-theme.ts`）

整体背景按自然日从 7 套柔和浅色主题中轮换：

- `daily-theme.ts` 定义 7 套主题（渐变 / 柔光球 / 神经元粒子 RGB），`getDailyTheme()` 用「纪元日数 % 7」取当天主题。
- `DailyThemeBackground`（挂载在根布局）在客户端挂载后把当天渐变写到 `<body>`，并渲染两个随主题变色的柔光球 + 神经元粒子背景；SSR 阶段不渲染装饰，避免闪烁与 hydration 不一致。
- 全站（首页 / 文库 / 详情页）共用同一套当日主题，保持整体协调。

### 6. 滚动进度与平滑滚动

- 右侧 `ScrollProgress`：6 个圆点（对应 6 张卡片），当前卡片圆点高亮放大，点击圆点翻页；仅在翻页环境显示。
- `scroll.ts` 的 `smoothScrollTo`：easeInOutCubic 缓动 + 固定导航偏移，尊重系统「减少动态效果」。

---

## 内容管理（如何增改内容）

### 📚 新增一张知识卡片

在 `public/knowledge/` 新建 `.md` 文件（**文件名即 id** → 详情页 `/knowledge/文件名`）：

```markdown
---
title: 我的知识笔记
category: 认知神经科学
summary: 一句话摘要（首页/列表页展示）
tags: [标签A, 标签B]
updated: 2024-07        # 'YYYY-MM'，用于时间倒序
intro: 详情页引言（支持 Markdown）
---
详情页正文，支持 Markdown：## 标题、- 列表、**加粗**、> 引用
```

### 📄 新增/导入一篇文献

在 `public/papers/` 新建 `.md` 文件（文件名即 id → `/papers/文件名`），frontmatter 系统自动提取：

```markdown
---
title: 论文标题
authors: [作者A, 作者B]
year: 2024
venue: 期刊/来源
doi: 10.xxxx/xxxxx
citations: 128
rating: 4                    # 1-5
status: 未读                 # 未读 / 在读 / 已读
topics: [课题A, 课题B]        # 可多个（交叉课题文献填多个，文库按课题筛选）
tags: [标签A]
created: 2024-06             # 'YYYY-MM'，「最近加入」排序
updated: 2024-07             # 笔记更新时间
summary: 一句话摘要
intro: 详情页引言
---
正文（支持 Markdown）
```

### 📦 新增一个代码业务流

在 `public/code-examples/` 新建 `.md` 文件（文件名即 id）：

```markdown
---
title: 我的业务流名称
summary: 一句话简介（卡片 / 列表展示）
tags: [标签A, 标签B]
github: https://github.com/xxx/yyy          # 主仓库链接
links:                                       # 可选：业务流内子模块 / 关联仓库
  - label: 子模块A
    url: https://github.com/xxx/aaa
updated: 2024-06                             # 'YYYY-MM'，最近更新排序
---
业务流正文（支持 Markdown）
```

每个业务流 = 一张卡片（首页展示最新 3 个，列表页展示全部），卡片底部是主 GitHub 链接按钮，子模块以标签形式链接到各自仓库。

### ⚙️ 首页展示条数 / 文案

在 `src/lib/data.ts` 对应区块调整：`experience.visibleCount`（知识库）、`papers.visibleCount`（论文）、`codeExamples.visibleCount`（代码案例）、`projects.visibleCount`（项目）等；各类按钮文案（`showMoreLabel` / `detailLinkLabel` / `listPage`）也在同一文件。

---

## 关键实现细节速查

- **首页 Hero 高度**：Hero 用 `h-screen`（视口单位）真正占满整屏；不要把它父容器 `min-h-full` 改成 `h-full`，否则内容超出视口的区块会失去内部滚动。
- **锚点/深链接**：非翻页页面（如 `/knowledge`）点导航时，Header 用 `useRouter().push('/#about')` 回到首页并跳到对应卡片。
- **首屏卡顿**：核心对策是懒挂载 + `.pager-card-hidden` 暂停动画；「查看更多」首次点击卡顿已通过 `router.prefetch` + dev 预取热编译解决。
- **每日主题改数量**：编辑 `DAILY_THEMES` 数组即可；`getDailyTheme` 自动按新数量取模。
- **列表入场动画**：`.stagger-in` 在 `globals.css`，需要时给列表项加该类 + 内联 `animationDelay` 即可复用。

---

## 部署

`npm run build` 生成静态 `out/`，可部署到任意静态托管（Nginx / Vercel / GitHub Pages / S3…）。

- 若部署到 GitHub Pages 项目站点（`https://用户.github.io/仓库名/`），在 `next.config.mjs` 取消 `basePath` 注释并改成你的仓库名。
- 沙盒/受限网络下 `next/font` 拉取 Google Fonts 可能失败，站点会回退到系统字体（不影响功能，属环境问题而非代码 bug）。

