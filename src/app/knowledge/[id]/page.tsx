// src/app/knowledge/[id]/page.tsx
// 知识库详情页：全屏阅读布局 —— 顶部通栏渐变标题区 + 宽版正文 + 右侧吸附元信息栏。
// 页脚固定在页面最下方（与首页一致）。数据由 getKnowledgeById() 从 public/knowledge/*.md 读取。
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarDays, Clock3 } from 'lucide-react'
import Footer from '@/components/ui/Footer'
import Markdown from '@/components/ui/Markdown'
import ReadingProgress from '@/components/ui/ReadingProgress'
import { getAllKnowledge, getKnowledgeById } from '@/lib/knowledge'
import { site } from '@/lib/data'

// 静态导出：为每张知识卡片预生成静态页面
export function generateStaticParams() {
  return getAllKnowledge().map((item) => ({ id: item.id }))
}

// 页面标题 / SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getKnowledgeById(id)
  return {
    title: item ? `${item.title} · ${site.title}` : `知识库 · ${site.title}`,
    description: item?.summary,
  }
}

// 阅读时长估算：中文约每分钟 300 字
function readingMinutesOf(body: string): number {
  return Math.max(1, Math.round((body || '').length / 300))
}

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getKnowledgeById(id)
  if (!item) notFound()

  const readingMinutes = readingMinutesOf(item.body)
  const updatedText = item.updated || ''

  return (
    <main className="min-h-screen flex flex-col">
      {/* 阅读进度条（随滚动填充） */}
      <ReadingProgress />

      {/* ═══ 顶部通栏渐变标题区（全屏阅读入口） ═══ */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-700" />
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            返回知识库
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-white bg-white/15 rounded-full px-3 py-1 border border-white/20">
              {item.category}
            </span>
            {updatedText && (
              <span className="inline-flex items-center gap-1 text-xs text-white/70">
                <CalendarDays size={13} />
                {updatedText}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-white/70">
              <Clock3 size={13} />
              约 {readingMinutes} 分钟读完
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-white max-w-3xl leading-snug">
            {item.title}
          </h1>

          {item.summary && (
            <p className="mt-4 text-white/85 max-w-2xl leading-relaxed">{item.summary}</p>
          )}

          {item.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs text-white/90 bg-white/15 rounded-full border border-white/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ═══ 正文区：宽版文章列 + 右侧吸附元信息栏 ═══ */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-10">
            {/* 文章列 */}
            <article className="min-w-0">
              {/* 引言（支持 Markdown） */}
              {item.intro && (
                <div className="glass-card rounded-2xl px-6 py-5 mb-8 border-l-4 border-l-sky-400/70 text-slate-600 leading-relaxed">
                  <Markdown>{item.intro}</Markdown>
                </div>
              )}

              {/* 正文（支持 Markdown） */}
              {item.body ? (
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 md:p-10 shadow-lg shadow-indigo-500/5">
                  <Markdown>{item.body}</Markdown>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-16">（暂无正文）</div>
              )}

              {/* 底部：产品 × 研究视角 */}
              <p className="mt-8 text-xs text-slate-400">
                脑科学 × 神经科学研究 · 持续沉淀
              </p>
            </article>

            {/* 右侧吸附元信息栏（桌面端显示，移动端隐藏） */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="glass-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <BookOpen size={16} className="text-sky-600" />
                    文章信息
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-500">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">分类</span>
                      <span className="font-medium text-sky-600">{item.category}</span>
                    </div>
                    {updatedText && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">更新</span>
                        <span>{updatedText}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">阅读</span>
                      <span>约 {readingMinutes} 分钟</span>
                    </div>
                  </div>

                  {item.tags.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">标签</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/knowledge"
                  className="glass-card rounded-2xl px-5 py-3.5 text-sm text-sky-600 hover:text-sky-700 hover:border-sky-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={15} />
                  返回知识库
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
