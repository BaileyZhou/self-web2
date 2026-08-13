// src/components/ui/Pagination.tsx
// 三个文库（知识库/论文/代码案例）共用的分页条：上一页 + 带省略号的页码 + 下一页。
// 仅通过 accent（主题色）与 className（外层间距）区分，总页数 ≤1 时不渲染。
interface PaginationAccent {
  hoverText: string
  hoverBorder: string
  activeFrom: string
  activeTo: string
  activeShadow: string
  pageHover: string
}

const ACCENTS: Record<'sky' | 'rose' | 'fuchsia', PaginationAccent> = {
  sky: {
    hoverText: 'hover:text-sky-600',
    hoverBorder: 'hover:border-sky-300',
    activeFrom: 'from-sky-600',
    activeTo: 'to-indigo-600',
    activeShadow: 'shadow-sky-500/25',
    pageHover: 'hover:text-sky-600 hover:bg-sky-50',
  },
  rose: {
    hoverText: 'hover:text-rose-600',
    hoverBorder: 'hover:border-rose-300',
    activeFrom: 'from-rose-600',
    activeTo: 'to-pink-600',
    activeShadow: 'shadow-rose-500/25',
    pageHover: 'hover:text-rose-600 hover:bg-rose-50',
  },
  fuchsia: {
    hoverText: 'hover:text-fuchsia-600',
    hoverBorder: 'hover:border-fuchsia-300',
    activeFrom: 'from-fuchsia-600',
    activeTo: 'to-violet-600',
    activeShadow: 'shadow-fuchsia-500/25',
    pageHover: 'hover:text-fuchsia-600 hover:bg-fuchsia-50',
  },
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  accent = 'sky',
  className = 'mt-8',
}: {
  /** 当前页码（safePage） */
  page: number
  totalPages: number
  /** 翻页回调（含页码钳制 + 回到顶部） */
  onChange: (p: number) => void
  accent?: 'sky' | 'rose' | 'fuchsia'
  className?: string
}) {
  if (totalPages <= 1) return null
  const a = ACCENTS[accent]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={`px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 ${a.hoverText} ${a.hoverBorder} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        上一页
      </button>

      {pages.map((p, idx, arr) => {
        const prev = arr[idx - 1]
        return (
          <span key={p} className="flex items-center gap-2">
            {prev != null && p - prev > 1 && <span className="text-slate-400">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              className={`h-9 w-9 rounded-full text-sm transition-all ${
                p === page
                  ? `bg-gradient-to-br ${a.activeFrom} ${a.activeTo} text-white shadow-md ${a.activeShadow}`
                  : `text-slate-600 ${a.pageHover}`
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={`px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 ${a.hoverText} ${a.hoverBorder} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        下一页
      </button>
    </div>
  )
}
