// src/components/sections/Papers.tsx
// “论文阅读”区块（首页）：展示最近更新的几篇文献卡片（条数由 papers.visibleCount 控制），
// 点击卡片进入详情页；「查看更多」进入论文文库 /papers（支持检索、排序与筛选）。
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import LayeredContent from '@/components/ui/LayeredContent'
import PaperCard from '@/components/sections/PaperCard'
import PapersIllustration from '@/components/sections/PapersIllustration'
import { papers } from '@/lib/data'
import type { PaperItem } from '@/lib/papers-types'

export default function Papers({
  items = [],
}: {
  items?: PaperItem[]
}) {
  const router = useRouter()

  // 预加载论文文库页：让 /papers 的路由 chunk 与服务端渲染在用户点击前就绪，
  // 避免首次点击「查看更多」时等待下载/渲染造成的卡顿。
  useEffect(() => {
    router.prefetch(papers.listPage)
    if (process.env.NODE_ENV === 'development') {
      fetch(papers.listPage, { cache: 'no-store' }).catch(() => {})
    }
  }, [router])

  // 首页展示「最近更新前 N 条」（N = papers.visibleCount；数据已由服务端排序后传入）
  const displayed = items.slice(0, papers.visibleCount)

  return (
    <Section id="papers" variant="rose" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={papers.title}
          subtitle={papers.subtitle}
          badge={papers.badge}
          index="04"
        />

        <LayeredContent illustration={<PapersIllustration />} className="mt-8" side="left">
          {/* 论文卡片（毛玻璃浮于底层插画之上，最近更新前 N 条） */}
          <div className="grid sm:grid-cols-2 gap-6">
            {displayed.map((paper) => (
              <PaperCard key={paper.id} paper={paper} detailLabel={papers.detailLinkLabel} />
            ))}
          </div>
        </LayeredContent>

        {/* 查看更多 → 进入论文文库（不在当前页展开） */}
        <div className="text-center mt-10">
          <Link
            href={papers.listPage}
            className="px-6 py-2.5 rounded-full border border-rose-200/50 text-slate-600 hover:text-rose-600 hover:border-rose-400 transition-all glass-card"
          >
            {papers.showMoreLabel}
          </Link>
        </div>
      </div>
    </Section>
  )
}