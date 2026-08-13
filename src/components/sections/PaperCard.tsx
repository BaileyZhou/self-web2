// src/components/sections/PaperCard.tsx
// 论文卡片：首页论文区块与论文文库列表页共用，样式保持一致。
// 点击整张卡片进入 /papers/{id} 详情页。
import Link from 'next/link'
import { ArrowRight, BookOpen, Star } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { PaperItem } from '@/lib/papers-types'

// 阅读状态徽标配色
const statusStyles: Record<string, string> = {
  已读: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  在读: 'bg-amber-50 text-amber-600 border-amber-200/60',
  未读: 'bg-slate-100 text-slate-500 border-slate-200/60',
}

export default function PaperCard({
  paper,
  detailLabel = '阅读全文 →',
}: {
  paper: PaperItem
  detailLabel?: string
}) {
  const statusCls = statusStyles[paper.status] || statusStyles['未读']

  return (
    <Link href={`/papers/${paper.id}`} className="group block h-full">
      <Card className="h-full" hoverGradient="from-rose-500 to-pink-600">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1">
              {(paper.topics && paper.topics.length ? paper.topics : ['未归入课题'])
                .slice(0, 2)
                .map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium text-rose-600 bg-rose-50/80 rounded-full px-2 py-0.5 border border-rose-200/50 group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40"
                  >
                    {t}
                  </span>
                ))}
              {(paper.topics?.length ?? 0) > 2 && (
                <span className="text-xs text-rose-400 self-center group-hover:text-rose-100">+{(paper.topics?.length ?? 0) - 2}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {paper.status && (
                <span className={`text-xs rounded-full px-2 py-0.5 border group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40 ${statusCls}`}>
                  {paper.status}
                </span>
              )}
              {paper.year && <span className="text-xs text-slate-400 group-hover:text-rose-100">{paper.year}</span>}
            </div>
          </div>

          <h3 className="text-base font-semibold text-slate-800 text-lift group-hover:text-white transition-colors duration-300 leading-snug">
            {paper.title}
          </h3>

          <p className="text-xs text-slate-400 group-hover:text-rose-100 mt-1 line-clamp-1">
            {paper.authors?.length > 0 ? `${paper.authors.join('、')} · ${paper.venue}` : paper.venue}
          </p>

          <p className="text-sm text-slate-500 text-lift leading-relaxed line-clamp-3 flex-1 mt-2 group-hover:text-rose-50">
            {paper.summary}
          </p>

          {paper.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {paper.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full group-hover:text-white group-hover:bg-white/25">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 group-hover:border-white/30 text-sm text-rose-600 group-hover:text-white font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            {detailLabel}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
