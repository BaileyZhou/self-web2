// src/lib/knowledge-types.ts
// 知识卡片的共享类型定义。客户端与服务端通用（不依赖 Node API，可安全地被客户端组件 import）。
// 数据读取在 src/lib/knowledge.ts（服务端，fs 读取 public/knowledge/*.md）。
export interface KnowledgeItem {
  id: string
  title: string
  category: string
  summary: string
  tags: string[]
  updated: string
  intro: string
  body: string
}
