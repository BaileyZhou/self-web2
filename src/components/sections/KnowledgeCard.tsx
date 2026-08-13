// src/components/sections/KnowledgeCard.tsx
// 知识卡片：知识库首页与列表页共用，样式保持一致。
// 默认点击整张卡片进入 /knowledge/{id} 详情页；
// 列表页通过 onSelect 开启「点击选中 → 右侧预览」，不再直接跳转。
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { KnowledgeItem } from '@/lib/knowledge-types'

export default function KnowledgeCard({
  item,
  detailLabel = '阅读笔记 →',
  onSelect,
  selected = false,
}: {
  item: KnowledgeItem
  detailLabel?: string
  onSelect?: (id: string) => void
  selected?: boolean
}) {
  const inner = (
    <Card className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-sky-600 bg-sky-50/80 rounded-full px-2.5 py-1 border border-sky-200/50">
            {item.category}
          </span>
          {item.updated && <span className="text-xs text-slate-400">{item.updated}</span>}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20">
            <BookOpen size={15} />
          </span>
          <h3 className="text-base font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
            {item.title}
          </h3>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{item.summary}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-sky-600 font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
          {detailLabel}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Card>
  )

  // 列表页模式：点击仅选中（供右侧预览浮窗），不直接跳转
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={selected}
        className={`group block h-full w-full text-left rounded-2xl transition-all ${
          selected ? 'ring-2 ring-sky-300' : ''
        }`}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link href={`/knowledge/${item.id}`} className="group block h-full">
      {inner}
    </Link>
  )
}
