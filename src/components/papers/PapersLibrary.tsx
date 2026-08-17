// src/components/papers/PapersLibrary.tsx
// 论文文库列表页交互（客户端组件）：按截图「我的文库」布局实现 ——
// 左侧「课题 / 阅读状态」筛选、主区检索 / 排序 / 视图切换 / 分页、右侧文献详情面板。
// 数据由服务端页面 /papers 读取后通过 props 传入（src/lib/papers.ts 只能在服务端使用）。
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Star,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Library,
  Tags,
} from 'lucide-react'
import Footer from '@/components/ui/Footer'
import SearchInput from '@/components/ui/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { useIsLg } from '@/lib/use-media-query'
import { useRouter } from 'next/navigation'
import type { PaperItem } from '@/lib/papers-types'

/** 每页最多展示条数（与知识库/代码案例库一致） */
const PER_PAGE = 20

/** 排序方式（与截图一致） */
const SORT_OPTIONS = ['最近加入', '最近更新', '年份', '被引', '评分', '标题'] as const
type SortKey = (typeof SORT_OPTIONS)[number]

/** 阅读状态徽标配色 */
const statusStyles: Record<string, string> = {
  已读: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  在读: 'bg-amber-50 text-amber-600 border-amber-200/60',
  未读: 'bg-slate-100 text-slate-500 border-slate-200/60',
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 group-hover:text-white/50'}
        />
      ))}
    </span>
  )
}

/** 稳定的字符串散列：用于在课题超出显示上限时，稳定地“随机”决定隐藏哪一个（避免每次渲染重排） */
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** 课题标签（卡片 / 详情面板共用）：
 *  最多显示 max 个；当前筛选的课题（activeTopics）始终优先展示，
 *  若超出上限，则按稳定散列随机隐藏其余课题中的一个。 */
function TopicChips({
  topics,
  max = 2,
  activeTopics = [],
  seed = '',
}: {
  topics: string[]
  max?: number
  activeTopics?: string[]
  seed?: string
}) {
  const list = topics && topics.length ? topics : ['未归入课题']
  const active = list.filter((t) => activeTopics.includes(t))
  let toShow: string[]
  if (active.length === 0) {
    // 无筛选：按原顺序显示前 max 个
    toShow = list.slice(0, max)
  } else {
    // 有筛选：先展示当前选中的课题，再用稳定散列补足其余
    toShow = [...active]
    if (toShow.length < max) {
      const rest = list.filter((t) => !activeTopics.includes(t))
      const sorted = [...rest].sort(
        (a, b) => hashStr(`${seed}:${a}`) - hashStr(`${seed}:${b}`)
      )
      toShow.push(...sorted.slice(0, max - toShow.length))
    }
  }
  const hidden = list.length - toShow.length
  return (
    <span className="flex flex-wrap gap-1">
      {toShow.map((t) => (
        <span
          key={t}
          className="text-xs font-medium text-rose-600 bg-rose-50/80 rounded-full px-2 py-0.5 border border-rose-200/50 group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40"
        >
          {t}
        </span>
      ))}
      {hidden > 0 && <span className="text-xs text-rose-400 self-center group-hover:text-rose-100">+{hidden}</span>}
    </span>
  )
}

export default function PapersLibrary({ items }: { items: PaperItem[] }) {
  const [query, setQuery] = useState('')
  // 多选课题：空数组 = 全部文献；「未归入课题」作为特殊项参与多选
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  // 课题筛选模式：默认单选，可切换为多选
  const [multiSelect, setMultiSelect] = useState(false)
  const [status, setStatus] = useState('全部')
  const [sort, setSort] = useState<SortKey>('最近加入')
  const [view, setView] = useState<'standard' | 'compact'>('standard')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 桌面（lg+）有右侧浮窗：卡片点击=选中；平板/手机（<lg，浮窗隐藏）卡片点击=直接进详情页
  const isLg = useIsLg()
  const router = useRouter()
  const openPaper = (id: string) => (isLg ? setSelectedId(id) : router.push(`/papers/${id}`))

  // 课题列表（含各课题文献数；一篇文献可属于多个课题，会在每个课题里都计数）
  const topics = useMemo(() => {
    const counts = new Map<string, number>()
    let orphan = 0
    items.forEach((p) => {
      if (p.topics && p.topics.length) {
        p.topics.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
      } else {
        orphan++
      }
    })
    return {
      all: items.length,
      orphan,
      list: Array.from(counts.entries()).sort((a, b) => b[1] - a[1]),
    }
  }, [items])

  // 阅读状态计数（「有笔记」= 有正文或引言）
  const statusCounts = useMemo(() => {
    const c = { 全部: items.length, 未读: 0, 在读: 0, 已读: 0, 有笔记: 0 }
    items.forEach((p) => {
      if (p.status === '未读') c.未读++
      if (p.status === '在读') c.在读++
      if (p.status === '已读') c.已读++
      if (p.body || p.intro) c.有笔记++
    })
    return c
  }, [items])

  // 课题切换：单选模式点选替换、再点取消；多选模式累积/取消
  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => {
      if (multiSelect) {
        return prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
      }
      // 单选：选中当前项，重复点击则取消
      return prev.includes(t) ? [] : [t]
    })
    setPage(1)
  }

  // 单选 ↔ 多选 切换：切回单选时，若已选多个只保留最后一个
  const toggleMultiMode = () => {
    if (multiSelect && selectedTopics.length > 1) {
      setSelectedTopics((prev) => prev.slice(-1))
    }
    setMultiSelect((v) => !v)
    setPage(1)
  }

  // 关键字 + 课题(多选 OR) + 阅读状态 过滤
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      // 多选课题：任一选中课题匹配即通过；「未归入课题」= 无课题的文献
      if (selectedTopics.length > 0) {
        const hasTopics = p.topics && p.topics.length > 0
        const matchTopic = selectedTopics.some((t) =>
          t === '未归入课题' ? !hasTopics : (p.topics || []).includes(t)
        )
        if (!matchTopic) return false
      }
      if (status !== '全部') {
        if (status === '有笔记') {
          if (!p.body && !p.intro) return false
        } else if (p.status !== status) {
          return false
        }
      }
      if (!q) return true
      const haystack = [p.title, ...(p.authors || []), p.venue, p.doi, ...(p.topics || []), ...(p.tags || [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query, selectedTopics, status])

  // 排序
  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case '最近加入':
        return arr.sort((a, b) => b.created.localeCompare(a.created))
      case '最近更新':
        return arr.sort((a, b) => b.updated.localeCompare(a.updated))
      case '年份':
        return arr.sort((a, b) => String(b.year).localeCompare(String(a.year)))
      case '被引':
        return arr.sort((a, b) => b.citations - a.citations)
      case '评分':
        return arr.sort((a, b) => b.rating - a.rating)
      case '标题':
        return arr.sort((a, b) => a.title.localeCompare(b.title, 'zh'))
      default:
        return arr
    }
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const current = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  const selected = items.find((p) => p.id === selectedId) || null

  const goPage = (n: number) => {
    setPage(Math.max(1, Math.min(n, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const statusCls = (s: string) => statusStyles[s] || statusStyles['未读']

  return (
    <>
      <div className="section-padding pt-24 pb-16 flex-1">
        <div className="container-custom max-w-7xl">
          {/* ═══ 顶部标题区 ═══ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <Library size={18} />
              <span className="text-xs font-medium tracking-widest">MY LIBRARY</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-800">
              我的<span className="gradient-text">文库</span>
            </h1>
            <p className="mt-2 text-slate-500">终身学习，持续成长。</p>
          </div>

          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)_320px] gap-6">
            {/* ═══ 左侧：课题 + 阅读状态 ═══ */}
            <aside className="space-y-5 self-start">
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-400">课题</p>
                  <button
                    type="button"
                    onClick={toggleMultiMode}
                    aria-pressed={multiSelect}
                    title={multiSelect ? '切换为单选' : '切换为多选'}
                    className="flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <span
                      className={
                        multiSelect
                          ? 'text-rose-600 font-medium'
                          : 'text-slate-400 hover:text-rose-600'
                      }
                    >
                      {multiSelect ? '多选' : '单选'}
                    </span>
                    <span
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                        multiSelect ? 'bg-rose-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                          multiSelect ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                  </button>
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopics([])
                      setPage(1)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedTopics.length === 0
                        ? 'bg-rose-50 text-rose-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>全部文献</span>
                    <span className="text-xs text-slate-400">{topics.all}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTopic('未归入课题')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedTopics.includes('未归入课题')
                        ? 'bg-rose-50 text-rose-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>未归入课题</span>
                    <span className="text-xs text-slate-400">{topics.orphan}</span>
                  </button>
                  {topics.list.map(([t, count]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTopic(t)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selectedTopics.includes(t)
                          ? 'bg-rose-50 text-rose-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{t}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-medium text-slate-400 mb-2">阅读状态</p>
                <div className="space-y-1">
                  {(['全部', '未读', '在读', '已读', '有笔记'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatus(s)
                        setPage(1)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                        status === s
                          ? 'bg-rose-50 text-rose-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{s}</span>
                      <span className="text-xs text-slate-400">{statusCounts[s]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ═══ 主区：检索 / 排序 / 列表 ═══ */}
            <section className="min-w-0">
              {/* 主区头部 */}
              <div className="glass-card rounded-2xl p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                      {selectedTopics.length === 0
                        ? '全部文献'
                        : `已选 ${selectedTopics.length} 个课题`}
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      {filtered.length} 篇文献
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    选中文献后，可查看更多。
                  </p>
                </div>

                {/* 检索栏 */}
                <SearchInput
                  value={query}
                  onChange={(v) => {
                    setQuery(v)
                    setPage(1)
                  }}
                  placeholder="搜索标题、作者、DOI 或来源"
                  accent="rose"
                  className="mt-4"
                />

                {/* 排序 tabs + 视图切换 */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSort(s)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          sort === s
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => setView('standard')}
                      className={`px-1.5 py-0.5 rounded-md transition-all ${
                        view === 'standard'
                          ? 'bg-slate-100 text-slate-500'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      标准
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('compact')}
                      className={`px-1.5 py-0.5 rounded-md transition-all ${
                        view === 'compact'
                          ? 'bg-slate-100 text-slate-500'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      紧凑
                    </button>
                    <span className="ml-2">已显示 {(safePage - 1) * PER_PAGE + 1}~{Math.min(safePage * PER_PAGE, filtered.length)} / 共 {filtered.length} 篇</span>
                  </div>
                </div>
              </div>

              {/* 文献列表 */}
              <div className="mt-4">
                {filtered.length === 0 ? (
                  /* 空状态：无匹配文献时只提示更换检索词 */
                  <div className="glass-card rounded-2xl py-16 text-center">
                    <p className="text-slate-600 font-medium">无匹配的文献，请更换检索词。</p>
                  </div>
                ) : view === 'standard' ? (
                  /* 标准视图：卡片网格（key 含页码，翻页重新触发入场动画） */
                  <div key={safePage} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {current.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openPaper(p.id)}
                        style={{ animationDelay: `${Math.min(i * 70, 420)}ms` }}
                        className={`stagger-in text-left group relative card-hover-smooth h-full rounded-2xl p-5 border border-white/40 transition-all bg-white/25 backdrop-blur-md shadow-sm overflow-hidden ${
                          selectedId === p.id
                            ? 'ring-2 ring-rose-300'
                            : 'hover:border-rose-300 hover:shadow-md'
                        }`}
                      >
                        {/* 悬停渐变填充层（毛玻璃 → 玫瑰渐变） */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="relative">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <TopicChips topics={p.topics} activeTopics={selectedTopics} seed={p.id} />
                            <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 border group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40 ${statusCls(p.status)}`}>
                              {p.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800 text-lift group-hover:text-white leading-snug line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="text-xs text-slate-400 group-hover:text-rose-100 mt-1 line-clamp-1">
                            {p.authors.length ? p.authors.join('、') : ''}
                            {p.year ? ` · ${p.year}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 text-lift group-hover:text-rose-50 line-clamp-2 mt-2">{p.summary}</p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 group-hover:border-white/30">
                            <span className="text-xs text-slate-400 group-hover:text-white">{p.citations} 被引</span>
                            <RatingStars rating={p.rating} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* 紧凑视图：列表行（key 含页码，翻页重新触发入场动画） */
                  <div key={safePage} className="glass-card rounded-2xl divide-y divide-slate-100 overflow-hidden">
                    {current.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openPaper(p.id)}
                        style={{ animationDelay: `${Math.min(i * 70, 420)}ms` }}
                        className={`stagger-in w-full text-left flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-rose-50/40 ${
                          selectedId === p.id ? 'bg-rose-50/60 ring-2 ring-inset ring-rose-200' : ''
                        }`}
                      >
                        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${statusCls(p.status)}`}>
                          {p.status === '已读' ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {p.authors.length ? `${p.authors.join('、')} · ` : ''}
                            {p.venue}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{p.year}</span>
                        <RatingStars rating={p.rating} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 分页 */}
              <Pagination page={safePage} totalPages={totalPages} onChange={goPage} accent="rose" />
            </section>

            {/* ═══ 右侧：悬浮文献详情面板（随滚动保持可见，内部可滚动展示完整信息） ═══ */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain">
                {selected ? (
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <TopicChips topics={selected.topics} max={4} activeTopics={selectedTopics} seed={selected.id} />
                      <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 border ${statusCls(selected.status)}`}>
                        {selected.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 leading-snug">
                      {selected.title}
                    </h3>
                    {selected.authors.length > 0 && (
                      <p className="text-xs text-slate-500">{selected.authors.join('、')}</p>
                    )}

                    <div className="space-y-1.5 text-sm text-slate-500">
                      {selected.venue && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">期刊</span>
                          <span className="text-right">{selected.venue}</span>
                        </div>
                      )}
                      {selected.year && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">年份</span>
                          <span>{selected.year}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">被引</span>
                        <span>{selected.citations}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">评分</span>
                        <RatingStars rating={selected.rating} />
                      </div>
                      {selected.doi && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">DOI</span>
                          <a
                            href={`https://doi.org/${selected.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:underline truncate max-w-[160px]"
                          >
                            {selected.doi}
                          </a>
                        </div>
                      )}
                    </div>

                    {selected.summary && (
                      <p className="text-sm text-slate-500 leading-relaxed">{selected.summary}</p>
                    )}

                    {selected.tags.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {selected.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/papers/${selected.id}`}
                      className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-sm font-medium shadow-md shadow-rose-500/25 hover:-translate-y-0.5 transition-all"
                    >
                      <BookOpen size={15} /> 阅读全文
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl py-12 px-5 text-center">
                    <Tags size={28} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-400">选择一篇文献查看详情</p>
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
