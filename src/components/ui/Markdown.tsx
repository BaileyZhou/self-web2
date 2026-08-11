// src/components/ui/Markdown.tsx
// Markdown 渲染组件：把知识卡片的 content.body（Markdown 字符串）渲染成富文本。
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
