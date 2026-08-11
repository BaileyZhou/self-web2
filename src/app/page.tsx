// src/app/page.tsx
// 首页（服务端）：读取 public/knowledge/*.md，把时间倒序最新 N 条传给 CardPager，
// 供首页“知识库”卡片展示（N 由 data.ts 的 experience.visibleCount 控制）。
import CardPager from '@/components/ui/CardPager'
import { getAllKnowledge, sortKnowledgeDesc } from '@/lib/knowledge'
import { experience } from '@/lib/data'

export default function Home() {
  const items = sortKnowledgeDesc(getAllKnowledge()).slice(0, experience.visibleCount)
  return <CardPager experienceItems={items} />
}