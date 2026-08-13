// src/components/sections/CodeFlowCard.tsx
// 代码案例「业务流」卡片：首页与代码案例列表页共用。
// 列表页通过 onSelect 开启「点击选中 → 右侧预览」；卡片上的 GitHub 链接点击仅跳转（不触发选中）。
import { ArrowUpRight, Boxes, Github } from 'lucide-react'
import type { CodeFlowItem } from '@/lib/code-examples-types'

export default function CodeFlowCard({
  flow,
  githubLabel = '查看 GitHub',
  onSelect,
  selected = false,
}: {
  flow: CodeFlowItem
  githubLabel?: string
  onSelect?: (id: string) => void
  selected?: boolean
}) {
  return (
    <div
      className={`group relative card-hover-smooth h-full flex flex-col rounded-2xl p-5 border border-white/40 transition-all bg-white/25 backdrop-blur-md shadow-sm overflow-hidden ${
        selected
          ? 'ring-2 ring-fuchsia-300'
          : 'hover:border-fuchsia-300 hover:shadow-md'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? () => onSelect(flow.id) : undefined}
      role={onSelect ? 'button' : undefined}
      aria-pressed={onSelect ? selected : undefined}
    >
      {/* 悬停渐变填充层（毛玻璃 → 洋红紫渐变） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="relative flex flex-col flex-1">
        {/* 顶部：标签 + 更新时间 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1">
            {(flow.tags.length ? flow.tags : ['代码案例']).slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs font-medium text-fuchsia-600 bg-fuchsia-50/80 rounded-full px-2 py-0.5 border border-fuchsia-200/50 group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40"
              >
                {t}
              </span>
            ))}
          </div>
          {flow.updated && <span className="shrink-0 text-xs text-slate-400 group-hover:text-fuchsia-100">{flow.updated}</span>}
        </div>

        {/* 标题（业务流名称） */}
        <h3 className="text-sm font-semibold text-slate-800 text-lift leading-snug flex items-center gap-1.5 group-hover:text-white transition-colors duration-300">
          <Boxes size={15} className="shrink-0 text-fuchsia-500 group-hover:text-white" />
          <span className="line-clamp-1">{flow.title}</span>
        </h3>

        {/* 简介 */}
        <p className="text-xs text-slate-500 text-lift line-clamp-2 mt-1.5 flex-1 group-hover:text-fuchsia-50">{flow.summary}</p>

        {/* 子模块 / 关联仓库链接 */}
        {flow.links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {flow.links.slice(0, 2).map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors group-hover:text-white group-hover:bg-white/25"
              >
                <Github size={11} /> {l.label}
              </a>
            ))}
            {flow.links.length > 2 && (
              <span className="text-xs text-slate-400 self-center group-hover:text-fuchsia-100">+{flow.links.length - 2}</span>
            )}
          </div>
        )}

        {/* 主 GitHub 链接 */}
        <div className="mt-3 pt-3 border-t border-slate-100 group-hover:border-white/30">
          <a
            href={flow.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-xs font-medium shadow-md shadow-fuchsia-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Github size={14} /> {githubLabel} <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}
