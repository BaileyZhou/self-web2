// src/app/knowledge/[id]/page.tsx
// 知识库详情页：展示某张知识卡片的完整知识总结（数据来自 src/lib/data.ts 的 experience.items）
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react'
import { experience, site } from '@/lib/data'

// 静态导出：为每张知识卡片预生成静态页面
export function generateStaticParams() {
  return experience.items.map((item) => ({ id: item.id }))
}

// 页面标题 / SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = experience.items.find((i) => i.id === id)
  return {
    title: item ? `${item.title} · ${site.title}` : `知识库 · ${site.title}`,
    description: item?.summary,
  }
}

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = experience.items.find((i) => i.id === id)
  if (!item) notFound()

  return (
    <main className="section-padding pt-28 pb-20">
      <div className="container-custom max-w-3xl">
        {/* 返回知识库 */}
        <Link
          href="/#experience"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          返回知识库
        </Link>

        <article className="glass-card rounded-2xl overflow-hidden">
          {/* 顶部渐变条（呼应站点渐变体系） */}
          <div className="h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

          <div className="p-6 md:p-10">
            {/* 头部：分类 + 更新时间 + 标题 */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-medium text-sky-600 bg-sky-50/80 rounded-full px-3 py-1 border border-sky-200/50">
                {item.category}
              </span>
              {item.updated && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays size={13} />
                  {item.updated}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25 mt-1">
                <BookOpen size={18} />
              </span>
              {item.title}
            </h1>

            {/* 引言 */}
            {item.content?.intro && (
              <p className="mt-5 text-slate-600 leading-relaxed border-l-4 border-sky-400/60 pl-4">
                {item.content.intro}
              </p>
            )}

            {/* 知识小结节 */}
            {item.content?.sections?.map((section, idx) => (
              <section key={idx} className="mt-8">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-2">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* 标签 */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-slate-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
