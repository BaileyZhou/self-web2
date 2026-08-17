// src/components/knowledge/KnowledgeBrowser.tsx
// 知识库列表页交互（客户端组件）：关键字检索、分类筛选与分页（每页 20 条）。
// 数据由服务端页面 /knowledge 读取后通过 props 传入（src/lib/knowledge.ts 只能在服务端使用）。
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, SearchX } from 'lucide-react'
import KnowledgeCard from '@/components/sections/KnowledgeCard'
import Footer from '@/components/ui/Footer'
import SearchInput from '@/components/ui/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { useIsLg } from '@/lib/use-media-query'
import type { KnowledgeItem } from '@/lib/knowledge-types'

/** 每页最多展示条数 */
const PER_PAGE = 20
/** 卡片底部“进入详情页”链接的文字（与首页知识库卡片保持一致） */
const DETAIL_LABEL = '阅读笔记 →'

export default function KnowledgeBrowser({ items }: { items: KnowledgeItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [page, setPage] = useState(1)
  // 右侧预览浮窗：点击卡片选中（在所有条目中查找，筛选后仍保持显示）
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = items.find((i) => i.id === selectedId) || null
  // 桌面（lg+）有右侧浮窗：卡片点击=选中；平板/手机（<lg，浮窗隐藏）卡片点击=直接进详情页
  const isLg = useIsLg()

  // 全部分类（保持出现顺序，用于筛选）
  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  )

  // 关键字 + 分类过滤
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== '全部' && item.category !== category) return false
      if (!q) return true
      const haystack = [item.title, item.summary, item.category, (item.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const currentItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const goPage = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages))
    setPage(next)
    // 翻页后回到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* 内容区 flex-1，页脚固定在页面最下方 */}
      <div className="section-padding pt-24 pb-16 flex-1">
        <div className="container-custom max-w-6xl">
          {/* ═══ 头部：检索栏（产品经理 × 神经科学设计） ═══ */}
          <div className="glass-card rounded-2xl p-6 md:p-10 relative overflow-hidden text-center">
            {/* 背景装饰：柔光 + 脑波线 */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-sky-200/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl" />
              <svg
                viewBox="0 0 800 80"
                className="absolute bottom-2 left-0 w-full opacity-20"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 40 Q 50 10 100 40 T 200 40 T 300 40 T 400 40 T 500 40 T 600 40 T 700 40 T 800 40"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
                <Brain size={26} />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-800">
                知识<span className="gradient-text">库</span>
              </h1>
              <p className="mt-2 text-slate-500 max-w-xl mx-auto">
                以产品经理与神经科学研究者的双重视角，沉淀每一份认知
              </p>
              <p className="mt-1 text-xs text-slate-400">
                共 {filtered.length} 条笔记 · 每页最多 {PER_PAGE} 条 · 按时间倒序
              </p>

              {/* 检索栏 */}
              <div className="mt-6 flex items-center gap-2 max-w-xl mx-auto">
                <SearchInput
                  value={query}
                  onChange={(v) => {
                    setQuery(v)
                    setPage(1)
                  }}
                  placeholder="请输入关键字检索知识笔记…"
                  accent="sky"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all"
                >
                  搜索
                </button>
              </div>

              {/* 分类筛选 */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c)
                      setPage(1)
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      category === c
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-transparent shadow-md shadow-sky-500/20'
                        : 'text-slate-600 border-slate-200 bg-white/70 hover:border-sky-300 hover:text-sky-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ 主区 + 右侧预览浮窗 ═══ */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mt-4">
            <section className="min-w-0">
              {/* 卡片网格（与首页同款式样）；key 含页码，翻页时重新触发入场动画 */}
              {currentItems.length > 0 ? (
                <div key={safePage} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="stagger-in"
                      style={{ animationDelay: `${Math.min(i * 70, 420)}ms` }}
                    >
                      <KnowledgeCard
                        item={item}
                        detailLabel={DETAIL_LABEL}
                        onSelect={isLg ? setSelectedId : undefined}
                        selected={selectedId === item.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
            <div className="text-center mt-16 text-slate-400">
              <SearchX size={40} className="mx-auto mb-3" />
              <p>没有找到匹配的知识笔记，换个关键字试试？</p>
            </div>
          )}

          {/* ═══ 分页（每页最多 20 条） ═══ */}
          <Pagination page={safePage} totalPages={totalPages} onChange={goPage} accent="sky" className="mt-12" />
            </section>

            {/* ═══ 右侧：悬浮知识卡片预览浮窗（与论文/代码案例库一致） ═══ */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain">
                {selected ? (
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-sky-600 bg-sky-50/80 rounded-full px-2.5 py-1 border border-sky-200/50">
                        {selected.category}
                      </span>
                      {selected.updated && (
                        <span className="text-xs text-slate-400">{selected.updated}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 leading-snug">
                      {selected.title}
                    </h3>
                    {selected.intro && (
                      <p className="text-sm text-slate-500 leading-relaxed">{selected.intro}</p>
                    )}
                    <p className="text-sm text-slate-500 leading-relaxed">{selected.summary}</p>
                    {selected.tags && selected.tags.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {selected.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/knowledge/${selected.id}`}
                      className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-medium shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
                    >
                      <BookOpen size={15} /> 阅读笔记 <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl py-12 px-5 text-center">
                    <BookOpen size={28} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-400">选择一张知识卡片查看详情</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
