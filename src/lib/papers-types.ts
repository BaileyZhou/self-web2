// src/lib/papers-types.ts
// 论文/文献的共享类型定义。客户端与服务端通用（不依赖 Node API，可安全地被客户端组件 import）。
// 数据读取在 src/lib/papers.ts（服务端，fs 读取 public/papers/*.md）。
export interface PaperItem {
  id: string
  title: string
  authors: string[]
  year: string
  venue: string
  doi: string
  citations: number
  rating: number
  status: string
  topics: string[]
  tags: string[]
  created: string
  updated: string
  summary: string
  intro: string
  body: string
}
