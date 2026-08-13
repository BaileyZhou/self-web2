// src/components/sections/Experience.tsx
// “知识库”区块（首页）：展示时间倒序最新 4 条知识卡片，
// 点击卡片进入详情页；「查看更多」进入知识库列表页 /knowledge（支持检索与分页）。
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import LayeredContent from '@/components/ui/LayeredContent'
import KnowledgeCard from '@/components/sections/KnowledgeCard'
import KnowledgeIllustration from '@/components/sections/KnowledgeIllustration'
import { experience } from '@/lib/data'
import type { KnowledgeItem } from '@/lib/knowledge-types'

export default function Experience({
  items = [],
}: {
  items?: KnowledgeItem[]
}) {
  const router = useRouter()

  // 预加载知识库列表页：让 /knowledge 的路由 chunk 与服务端渲染在用户点击前就绪，
  // 避免首次点击「查看更多」时等待下载/渲染造成的卡顿。
  useEffect(() => {
    // 生产环境：Next 预取 /knowledge（chunk + RSC），点击即秒开
    router.prefetch(experience.listPage)
    // dev 环境：Next 会禁用 prefetch，且 /knowledge 首次请求会触发服务端冷编译（可达数秒）；
    // 这里后台请求一次，提前完成编译，让首次点击不再卡顿。
    if (process.env.NODE_ENV === 'development') {
      fetch(experience.listPage, { cache: 'no-store' }).catch(() => {})
    }
  }, [router])

  // 首页展示「时间倒序最新 N 条」（N = experience.visibleCount；数据已由服务端排序后传入）
  const displayed = items.slice(0, experience.visibleCount)

  return (
    <Section id="experience" variant="sky" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={experience.title}
          subtitle={experience.subtitle}
          badge={experience.badge}
          index="03"
        />

        <LayeredContent illustration={<KnowledgeIllustration />} className="mt-8" side="right">
          {/* 知识卡片（毛玻璃浮于底层插画之上，时间倒序前 N 条） */}
          <div className="grid sm:grid-cols-2 gap-6">
            {displayed.map((item) => (
              <KnowledgeCard key={item.id} item={item} detailLabel={experience.detailLinkLabel} />
            ))}
          </div>
        </LayeredContent>

        {/* 查看更多 → 进入知识库列表页（不在当前页展开） */}
        <div className="text-center mt-10">
          <Link
            href={experience.listPage}
            className="px-6 py-2.5 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
          >
            {experience.showMoreLabel}
          </Link>
        </div>
      </div>
    </Section>
  )
}