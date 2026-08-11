// src/app/knowledge/page.tsx
// 知识库列表页（服务端）：读取 public/knowledge/*.md 的全部卡片并做时间倒序，
// 交给客户端 <KnowledgeBrowser /> 完成检索 / 分类 / 分页交互；页脚固定在页面最下方。
// 新增知识卡片 = 在 public/knowledge/ 目录下新建一个 .md 文件即可。
import { getAllKnowledge, sortKnowledgeDesc } from '@/lib/knowledge'
import KnowledgeBrowser from '@/components/knowledge/KnowledgeBrowser'

export default function KnowledgeListPage() {
  const items = sortKnowledgeDesc(getAllKnowledge())
  return (
    <main className="min-h-screen flex flex-col">
      <KnowledgeBrowser items={items} />
    </main>
  )
}

