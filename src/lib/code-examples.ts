// src/lib/code-examples.ts
// 代码案例（业务流）数据读取：每个业务流是一个独立的 Markdown 文件，放在
// public/code-examples/ 目录下（文件名即业务流 id，如 eeg-analysis-pipeline.md）。
//
//  ⭐ 新增/管理业务流：在 public/code-examples/ 下新建/编辑 .md 文件即可（文件名即 id）。
//     系统会自动提取 frontmatter 中的关键内容；正文用于业务流详情展示。
//
//     示例 public/code-examples/my-flow.md：
//     ---
//     title: 我的业务流名称
//     summary: 一句话简介（卡片 / 列表展示）
//     tags: [标签A, 标签B]
//     github: https://github.com/xxx/yyy          # 主仓库链接
//     links:                                       # 业务流内关联仓库（可选，可多个）
//       - label: 子模块A
//         url: https://github.com/xxx/aaa
//       - label: 子模块B
//         url: https://github.com/xxx/bbb
//     updated: 2024-06                            # 'YYYY-MM'，列表“最近更新”排序
//     ---
//     业务流正文（支持 Markdown）：## 标题、- 列表、> 引用
//
//  ⚠️ 本模块使用 Node fs，只能在服务端组件（page 等）中使用，
//     客户端组件请通过 props 接收数据，不要直接 import 本模块。
import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { CodeFlowItem, CodeFlowLink } from './code-examples-types'

export type { CodeFlowItem, CodeFlowLink } from './code-examples-types'

/** public/code-examples/ 目录（每个 .md 文件 = 一个业务流） */
const CODE_DIR = path.join(process.cwd(), 'public', 'code-examples')

/** 读取全部业务流（构建时执行；代码案例列表页 / 首页用） */
export function getAllCodeFlows(): CodeFlowItem[] {
  if (!fs.existsSync(CODE_DIR)) return []
  return fs
    .readdirSync(CODE_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const id = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(CODE_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      const links: CodeFlowLink[] = Array.isArray(data.links)
        ? data.links
            .filter((l: unknown) => l && typeof l === 'object')
            .map((l: Record<string, unknown>) => ({
              label: String(l.label || ''),
              url: String(l.url || ''),
            }))
            .filter((l) => l.label && l.url)
        : []
      return {
        id,
        title: data.title || id,
        summary: String(data.summary || ''),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        github: String(data.github || ''),
        links,
        updated: String(data.updated || ''),
        body: content.trim(),
      }
    })
}

/** 按 id 读取单个业务流 */
export function getCodeFlowById(id: string): CodeFlowItem | undefined {
  return getAllCodeFlows().find((c) => c.id === id)
}

/** 按「最近更新」倒序排序（updated 为 'YYYY-MM' 可直接按字符串比较） */
export function sortCodeFlowsByUpdatedDesc(items: CodeFlowItem[]): CodeFlowItem[] {
  return [...items].sort((a, b) => b.updated.localeCompare(a.updated))
}
