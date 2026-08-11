// src/lib/knowledge.ts
// 知识库数据读取：每张知识卡片是一个独立的 Markdown 文件，放在
// public/knowledge/ 目录下（文件名即卡片 id，如 brain-network-plasticity.md）。
//
//  ⭐ 新增知识卡片：在 public/knowledge/ 下新建一个 .md 文件即可（文件名即 id）。
//     文件内容格式见下方示例；frontmatter（--- 之间）为卡片元信息，
//     其余部分为详情页 Markdown 正文。
//
//     示例 public/knowledge/my-note.md：
//     ---
//     title: 我的知识笔记
//     category: 认知神经科学
//     summary: 一句话摘要（首页/列表页展示）
//     tags: [标签A, 标签B]
//     updated: 2024-07
//     intro: 详情页引言（支持 Markdown）
//     ---
//     详情页正文，支持 Markdown：## 标题、- 列表、**加粗**、> 引用
//
//  ⚠️ 本模块使用 Node fs，只能在服务端组件（page 等）中使用，
//     客户端组件请通过 props 接收数据，不要直接 import 本模块。
import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { KnowledgeItem } from './knowledge-types'

export type { KnowledgeItem } from './knowledge-types'

/** public/knowledge/ 目录（每个 .md 文件 = 一张知识卡片） */
const KNOWLEDGE_DIR = path.join(process.cwd(), 'public', 'knowledge')

/** 读取全部知识卡片（构建时执行；列表页 / 首页用） */
export function getAllKnowledge(): KnowledgeItem[] {
  if (!fs.existsSync(KNOWLEDGE_DIR)) return []
  return fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const id = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      return {
        id,
        title: data.title || id,
        category: data.category || '未分类',
        summary: data.summary || '',
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        updated: String(data.updated || ''),
        intro: String(data.intro || ''),
        body: content.trim(),
      }
    })
}

/** 按 id 读取单张知识卡片（详情页用） */
export function getKnowledgeById(id: string): KnowledgeItem | undefined {
  return getAllKnowledge().find((k) => k.id === id)
}

/** 时间倒序排序（updated 为 'YYYY-MM' 可直接按字符串比较） */
export function sortKnowledgeDesc(items: KnowledgeItem[]): KnowledgeItem[] {
  return [...items].sort((a, b) => b.updated.localeCompare(a.updated))
}
