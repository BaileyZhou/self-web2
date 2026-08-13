---
title: 个人站点建设业务流
summary: 把「知识沉淀、论文阅读、代码案例」统一为文件驱动的静态站点业务流，实现内容与代码分离、一键构建部署。
tags: [Web, Next.js, Tailwind, 部署]
github: https://github.com/BaileyZhou/self-web2
links:
  - label: 站点源码
    url: https://github.com/BaileyZhou/self-web2
  - label: 内容生成脚本
    url: https://github.com/BaileyZhou/self-web2/tree/main/scripts
updated: 2024-08
---

## 业务流概览

- **内容即文件**：知识库 / 论文库 / 代码案例全部由 `public/*.md` 驱动
- **构建即发布**：`next build` 静态导出 `out/`，任意静态托管即可上线
- **体验一致**：卡片翻页器 + 每日主题 + 错落入场动画

## 设计要点

> 内容与代码分离：新增内容只需新建一个 `.md` 文件，无需改动组件。
