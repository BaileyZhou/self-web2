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
      className={`group h-full flex flex-col rounded-2xl p-5 border transition-all bg-white/70 backdrop-blur-sm shadow-sm ${
        selected
          ? 'border-fuchsia-400 ring-2 ring-fuchsia-200'
          : 'border-white/40 hover:border-fuchsia-300 hover:shadow-md'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? () => onSelect(flow.id) : undefined}
      role={onSelect ? 'button' : undefined}
      aria-pressed={onSelect ? selected : undefined}
    >
      {/* 顶部：标签 + 更新时间 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-1">
          {(flow.tags.length ? flow.tags : ['代码案例']).slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs font-medium text-fuchsia-600 bg-fuchsia-50/80 rounded-full px-2 py-0.5 border border-fuchsia-200/50"
            >
              {t}
            </span>
          ))}
        </div>
        {flow.updated && <span className="shrink-0 text-xs text-slate-400">{flow.updated}</span>}
      </div>

      {/* 标题（业务流名称） */}
      <h3 className="text-sm font-semibold text-slate-800 leading-snug flex items-center gap-1.5 group-hover:text-fuchsia-600 transition-colors">
        <Boxes size={15} className="shrink-0 text-fuchsia-500" />
        <span className="line-clamp-1">{flow.title}</span>
      </h3>

      {/* 简介 */}
      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 flex-1">{flow.summary}</p>

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
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors"
            >
              <Github size={11} /> {l.label}
            </a>
          ))}
          {flow.links.length > 2 && (
            <span className="text-xs text-slate-400 self-center">+{flow.links.length - 2}</span>
          )}
        </div>
      )}

      {/* 主 GitHub 链接 */}
      <div className="mt-3 pt-3 border-t border-slate-100">
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
  )
}
