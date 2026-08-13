// src/components/sections/CodeExamples.tsx
// “代码案例”区块（首页）：以「业务流」为单位展示最新 N 条业务流卡片（N = codeExamples.visibleCount），
// 卡片带 GitHub 超链接；「查看更多」进入代码案例列表页 /code-examples。
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import LayeredContent from '@/components/ui/LayeredContent'
import CodeFlowCard from '@/components/sections/CodeFlowCard'
import CodeIllustration from '@/components/sections/CodeIllustration'
import { codeExamples } from '@/lib/data'
import type { CodeFlowItem } from '@/lib/code-examples-types'

export default function CodeExamples({ items = [] }: { items?: CodeFlowItem[] }) {
  const router = useRouter()

  // 预加载代码案例列表页：避免首次点击「查看更多」时等待下载/渲染造成卡顿
  useEffect(() => {
    router.prefetch(codeExamples.listPage)
    if (process.env.NODE_ENV === 'development') {
      fetch(codeExamples.listPage, { cache: 'no-store' }).catch(() => {})
    }
  }, [router])

  // 首页展示「最近更新前 N 个业务流」（数据已由服务端排序后传入）
  const displayed = items.slice(0, codeExamples.visibleCount)

  return (
    <Section id="code-examples" variant="fuchsia" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={codeExamples.title}
          subtitle={codeExamples.subtitle}
          badge={codeExamples.badge}
          index="05"
        />

        <LayeredContent illustration={<CodeIllustration />} className="mt-8" side="right">
          {/* 业务流卡片（毛玻璃浮于底层插画之上，最近更新前 N 个） */}
          <div className="grid sm:grid-cols-2 gap-6">
            {displayed.map((flow) => (
              <CodeFlowCard key={flow.id} flow={flow} githubLabel={codeExamples.detailLinkLabel} />
            ))}
          </div>
        </LayeredContent>

        {/* 查看更多 → 进入代码案例列表页（不在当前页展开） */}
        <div className="text-center mt-10">
          <Link
            href={codeExamples.listPage}
            className="px-6 py-2.5 rounded-full border border-fuchsia-200/50 text-slate-600 hover:text-fuchsia-600 hover:border-fuchsia-400 transition-all glass-card"
          >
            {codeExamples.showMoreLabel}
          </Link>
        </div>
      </div>
    </Section>
  )
}
