// src/lib/papers.ts
// 论文（文献）库数据读取：每篇文献是一个独立的 Markdown 文件，放在
// public/papers/ 目录下（文件名即文献 id，如 brain-plasticity-cognitive-training.md）。
//
//  ⭐ 新增/导入文献：在 public/papers/ 下新建一个 .md 文件即可（文件名即 id）。
//     系统会自动提取 frontmatter 中的关键内容（标题、作者、年份、期刊、DOI、
//     被引、评分、阅读状态、课题、标签等），正文用于详情页展示。
//
//     示例 public/papers/my-paper.md：
//     ---
//     title: 论文标题
//     authors: [作者A, 作者B]        # 作者列表
//     year: 2024                     # 发表年份
//     venue: 期刊/来源名称           # 发表期刊或媒体
//     doi: 10.xxxx/xxxxx             # DOI（可选）
//     citations: 128                 # 被引次数（列表页排序用）
//     rating: 4                      # 评分 1-5（列表页排序用）
//     status: 未读                   # 阅读状态：未读 / 在读 / 已读
//     topics: [课题A, 课题B]          # 归入的课题（可多个，交叉课题论文填多个；文库按课题筛选）
//     tags: [标签A, 标签B]
//     created: 2024-06               # 加入文库的时间（'YYYY-MM'，列表页“最近加入”排序）
//     updated: 2024-07               # 最近更新（笔记时间，'YYYY-MM'）
//     summary: 一句话摘要（首页/列表页展示）
//     intro: 详情页引言（支持 Markdown）
//     ---
//     正文（支持 Markdown）：## 标题、- 列表、**加粗**、> 引用
//
//  ⚠️ 本模块使用 Node fs，只能在服务端组件（page 等）中使用，
//     客户端组件请通过 props 接收数据，不要直接 import 本模块。
import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { PaperItem } from './papers-types'

export type { PaperItem } from './papers-types'

/** public/papers/ 目录（每个 .md 文件 = 一篇文献） */
const PAPERS_DIR = path.join(process.cwd(), 'public', 'papers')

/** 读取全部文献（构建时执行；文库列表页 / 首页用） */
export function getAllPapers(): PaperItem[] {
  if (!fs.existsSync(PAPERS_DIR)) return []
  return fs
    .readdirSync(PAPERS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const id = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(PAPERS_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      return {
        id,
        title: data.title || id,
        authors: Array.isArray(data.authors) ? data.authors.map(String) : [],
        year: String(data.year ?? ''),
        venue: data.venue || data.journal || '',
        doi: String(data.doi || ''),
        citations: Number(data.citations || 0),
        rating: Number(data.rating || 0),
        status: String(data.status || '未读'),
        topics: Array.isArray(data.topics)
          ? data.topics.map(String)
          : data.topic
            ? [String(data.topic)]
            : [],
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        created: String(data.created || ''),
        updated: String(data.updated || ''),
        summary: String(data.summary || ''),
        intro: String(data.intro || ''),
        body: content.trim(),
      }
    })
}

/** 按 id 读取单篇文献（详情页用） */
export function getPaperById(id: string): PaperItem | undefined {
  return getAllPapers().find((p) => p.id === id)
}

/** 按「最近更新」倒序排序（updated 为 'YYYY-MM' 可直接按字符串比较） */
export function sortPapersByUpdatedDesc(items: PaperItem[]): PaperItem[] {
  return [...items].sort((a, b) => b.updated.localeCompare(a.updated))
}
