// src/app/papers/[id]/page.tsx
// 论文详情页：全屏阅读布局 —— 顶部通栏渐变标题区（标题/作者/期刊/年份/DOI 等元信息）
// + 宽版正文 + 右侧吸附元信息栏；页脚固定在页面最下方。
// 数据由 getPaperById() 从 public/papers/*.md 读取（frontmatter 自动提取关键内容）。
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  Star,
  ExternalLink,
} from 'lucide-react'
import Footer from '@/components/ui/Footer'
import Markdown from '@/components/ui/Markdown'
import ReadingProgress from '@/components/ui/ReadingProgress'
import { getAllPapers, getPaperById } from '@/lib/papers'
import { site } from '@/lib/data'

// 阅读状态徽标配色
const statusStyles: Record<string, string> = {
  已读: 'bg-emerald-500/15 text-emerald-100 border-emerald-300/30',
  在读: 'bg-amber-500/15 text-amber-100 border-amber-300/30',
  未读: 'bg-white/10 text-white/90 border-white/25',
}

// 静态导出：为每篇文献预生成静态页面
export function generateStaticParams() {
  return getAllPapers().map((p) => ({ id: p.id }))
}

// 页面标题 / SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const paper = getPaperById(id)
  return {
    title: paper ? `${paper.title} · ${site.title}` : `论文文库 · ${site.title}`,
    description: paper?.summary,
  }
}

// 阅读时长估算：中文约每分钟 300 字
function readingMinutesOf(body: string): number {
  return Math.max(1, Math.round((body || '').length / 300))
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const paper = getPaperById(id)
  if (!paper) notFound()

  const readingMinutes = readingMinutesOf(paper.body)
  const statusCls = statusStyles[paper.status] || statusStyles['未读']

  return (
    <main className="min-h-screen flex flex-col">
      {/* 阅读进度条（随滚动填充） */}
      <ReadingProgress />

      {/* ═══ 顶部通栏渐变标题区（全屏阅读入口） ═══ */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700" />
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <Link
            href="/papers"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            返回文库
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(paper.topics && paper.topics.length ? paper.topics : ['未归入课题']).map((t) => (
              <span
                key={t}
                className="text-xs font-medium text-white bg-white/15 rounded-full px-3 py-1 border border-white/20"
              >
                {t}
              </span>
            ))}
            {paper.status && (
              <span className={`text-xs rounded-full px-3 py-1 border ${statusCls}`}>
                {paper.status}
              </span>
            )}
            {paper.venue && (
              <span className="inline-flex items-center gap-1 text-xs text-white/70">
                <BookOpen size={13} />
                {paper.venue}
              </span>
            )}
            {paper.year && (
              <span className="inline-flex items-center gap-1 text-xs text-white/70">
                <CalendarDays size={13} />
                {paper.year}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-white/70">
              <Clock3 size={13} />
              约 {readingMinutes} 分钟读完
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-white max-w-3xl leading-snug">
            {paper.title}
          </h1>

          {paper.authors.length > 0 && (
            <p className="mt-4 text-white/85 text-sm md:text-base">
              {paper.authors.join('、')}
            </p>
          )}

          {paper.summary && (
            <p className="mt-3 text-white/85 max-w-2xl leading-relaxed">{paper.summary}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {paper.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {paper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs text-white/90 bg-white/15 rounded-full border border-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white underline underline-offset-2"
              >
                DOI: {paper.doi} <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ═══ 正文区：宽版文章列 + 右侧吸附元信息栏 ═══ */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-10">
            {/* 文章列 */}
            <article className="min-w-0">
              {/* 引言（支持 Markdown） */}
              {paper.intro && (
                <div className="glass-card rounded-2xl px-6 py-5 mb-8 border-l-4 border-l-rose-400/70 text-slate-600 leading-relaxed">
                  <Markdown>{paper.intro}</Markdown>
                </div>
              )}

              {/* 正文（支持 Markdown） */}
              {paper.body ? (
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 md:p-10 shadow-lg shadow-indigo-500/5">
                  <Markdown>{paper.body}</Markdown>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-16">（暂无正文）</div>
              )}

              <p className="mt-8 text-xs text-slate-400">
                脑科学 × 神经科学研究 · 文献精读与思考笔记
              </p>
            </article>

            {/* 右侧吸附元信息栏（桌面端显示，移动端隐藏） */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="glass-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <BookOpen size={16} className="text-rose-600" />
                    文献信息
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-500">
                    {paper.topics && paper.topics.length > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">课题</span>
                        <span className="font-medium text-rose-600 text-right">{paper.topics.join('、')}</span>
                      </div>
                    )}
                    {paper.status && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">状态</span>
                        <span>{paper.status}</span>
                      </div>
                    )}
                    {paper.venue && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">期刊</span>
                        <span className="text-right">{paper.venue}</span>
                      </div>
                    )}
                    {paper.year && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">年份</span>
                        <span>{paper.year}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">被引</span>
                      <span>{paper.citations}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">评分</span>
                      <span className="inline-flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        {paper.rating || '—'}
                      </span>
                    </div>
                  </div>

                  {paper.tags.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">标签</p>
                      <div className="flex flex-wrap gap-1.5">
                        {paper.tags.map((tag) => (
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
                  href="/papers"
                  className="glass-card rounded-2xl px-5 py-3.5 text-sm text-rose-600 hover:text-rose-700 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={15} />
                  返回文库
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
