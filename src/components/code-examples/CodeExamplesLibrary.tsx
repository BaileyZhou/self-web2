// src/components/code-examples/CodeExamplesLibrary.tsx
// 代码案例列表页交互（客户端组件）：以「业务流」为单位，支持关键字检索、分页与右侧预览浮窗。
// 每个业务流是一张卡片（点击选中 → 右侧预览，卡片含 GitHub 超链接）；
// 数据由服务端页面 /code-examples 读取后传入。
'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Boxes, Github, SearchX } from 'lucide-react'
import CodeFlowCard from '@/components/sections/CodeFlowCard'
import Footer from '@/components/ui/Footer'
import SearchInput from '@/components/ui/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { useIsLg } from '@/lib/use-media-query'
import type { CodeFlowItem } from '@/lib/code-examples-types'

/** 每页最多展示条数（与知识库/论文库一致） */
const PER_PAGE = 20
/** 卡片主按钮文字 */
const GITHUB_LABEL = '查看 GitHub'

export default function CodeExamplesLibrary({ items }: { items: CodeFlowItem[] }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  // 右侧预览浮窗：点击卡片选中（在所有条目中查找，筛选后仍保持显示）
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = items.find((f) => f.id === selectedId) || null
  // 桌面（lg+）有右侧浮窗：卡片点击=选中；平板/手机（<lg，浮窗隐藏）卡片直接点 GitHub 即可，无需选中
  const isLg = useIsLg()

  // 关键字检索：标题 / 简介 / 标签 / 子模块名
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((f) => {
      if (!q) return true
      const haystack = [f.title, f.summary, (f.tags || []).join(' '), ...(f.links || []).map((l) => l.label)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const current = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const goPage = (n: number) => {
    setPage(Math.max(1, Math.min(n, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="section-padding pt-24 pb-16 flex-1">
        <div className="container-custom max-w-6xl">
          {/* ═══ 顶部标题区 ═══ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-fuchsia-600 mb-1">
              <Boxes size={18} />
              <span className="text-xs font-medium tracking-widest">CODE FLOWS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-800">
              代码<span className="gradient-text">案例</span>
            </h1>
            <p className="mt-2 text-slate-500">以业务流为单位组织可复用代码与开源项目，每个业务流对应一组 GitHub 仓库。</p>
          </div>

          {/* ═══ 检索栏 ═══ */}
          <div className="glass-card rounded-2xl p-5">
            <SearchInput
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="搜索业务流、技术栈或标签…"
              accent="fuchsia"
            />
            <p className="mt-3 text-xs text-slate-400">
              共 {filtered.length} 个业务流 · 每页最多 {PER_PAGE} 个 · 按最近更新倒序
            </p>
          </div>

          {/* ═══ 主区 + 右侧预览浮窗 ═══ */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mt-4">
            <section className="min-w-0">
              {/* 业务流卡片网格（key 含页码，翻页重新触发入场动画） */}
              {filtered.length === 0 ? (
                <div className="glass-card rounded-2xl py-16 text-center">
                  <SearchX size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600 font-medium">无匹配的业务流，请更换检索词。</p>
                </div>
              ) : (
                <div key={safePage} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {current.map((f, i) => (
                    <div
                      key={f.id}
                      className="stagger-in"
                      style={{ animationDelay: `${Math.min(i * 70, 420)}ms` }}
                    >
                      <CodeFlowCard
                        flow={f}
                        githubLabel={GITHUB_LABEL}
                        onSelect={isLg ? setSelectedId : undefined}
                        selected={selectedId === f.id}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ═══ 分页 ═══ */}
              <Pagination page={safePage} totalPages={totalPages} onChange={goPage} accent="fuchsia" />
            </section>

            {/* ═══ 右侧：悬浮业务流预览浮窗（与论文/知识库一致的浮窗） ═══ */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain">
                {selected ? (
                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(selected.tags.length ? selected.tags : ['代码案例'])
                          .slice(0, 3)
                          .map((t) => (
                            <span
                              key={t}
                              className="text-xs font-medium text-fuchsia-600 bg-fuchsia-50/80 rounded-full px-2 py-0.5 border border-fuchsia-200/50"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                      {selected.updated && (
                        <span className="shrink-0 text-xs text-slate-400">{selected.updated}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 leading-snug">
                      {selected.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{selected.summary}</p>

                    {selected.links.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <p className="text-xs font-medium text-slate-400">相关仓库</p>
                        {selected.links.map((l) => (
                          <a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-fuchsia-600 hover:underline truncate"
                          >
                            <Github size={14} className="shrink-0" />
                            <span className="truncate">{l.label}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <a
                      href={selected.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-sm font-medium shadow-md shadow-fuchsia-500/25 hover:-translate-y-0.5 transition-all"
                    >
                      <Github size={15} /> {GITHUB_LABEL} <ArrowUpRight size={14} />
                    </a>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl py-12 px-5 text-center">
                    <Boxes size={28} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-400">选择一个业务流查看详情</p>
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
