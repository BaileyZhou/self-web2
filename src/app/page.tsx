// src/app/page.tsx
// 首页（服务端）：读取知识库与论文库的 Markdown 文件，把各自最新 N 条传给 CardPager，
// 供首页“知识库/论文阅读”卡片展示（N 由 data.ts 的 experience/papers.visibleCount 控制）。
import CardPager from '@/components/ui/CardPager'
import { getAllKnowledge, sortKnowledgeDesc } from '@/lib/knowledge'
import { getAllPapers, sortPapersByUpdatedDesc } from '@/lib/papers'
import { experience, papers } from '@/lib/data'

export default function Home() {
  const items = sortKnowledgeDesc(getAllKnowledge()).slice(0, experience.visibleCount)
  const paperItems = sortPapersByUpdatedDesc(getAllPapers()).slice(0, papers.visibleCount)
  return <CardPager experienceItems={items} papersItems={paperItems} />
}