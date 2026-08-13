// src/lib/code-examples-types.ts
// 代码案例（业务流）的共享类型定义：可被客户端组件安全引用（不含 fs / server-only）。

/** 业务流内的一个 GitHub 链接（如某个仓库 / 模块） */
export interface CodeFlowLink {
  /** 链接文字，如「预处理模块」 */
  label: string
  /** GitHub（或任意）URL */
  url: string
}

/** 一个业务流 = 一张卡片（一个 public/code-examples/*.md 文件） */
export interface CodeFlowItem {
  /** 唯一 id（= .md 文件名，不含扩展名） */
  id: string
  /** 业务流名称 */
  title: string
  /** 一句话简介（卡片 / 列表展示） */
  summary: string
  /** 技术/领域标签 */
  tags: string[]
  /** 主 GitHub 链接（业务流主仓库） */
  github: string
  /** 业务流内的子模块 / 关联仓库链接 */
  links: CodeFlowLink[]
  /** 最近更新时间 'YYYY-MM'（列表“最近更新”排序） */
  updated: string
  /** Markdown 正文（业务流详情描述） */
  body: string
}
