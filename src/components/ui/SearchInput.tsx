// src/components/ui/SearchInput.tsx
// 三个文库共用的搜索框：放大镜图标 + 输入框（输入即触发 onChange，由调用方重置页码）。
import { Search } from 'lucide-react'

const ACCENTS: Record<'sky' | 'rose' | 'fuchsia', { border: string; focus: string }> = {
  sky: { border: 'border-sky-200/60', focus: 'focus:ring-sky-400/40 focus:border-sky-400' },
  rose: { border: 'border-slate-200', focus: 'focus:ring-rose-400/40 focus:border-rose-400' },
  fuchsia: { border: 'border-slate-200', focus: 'focus:ring-fuchsia-400/40 focus:border-fuchsia-400' },
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '搜索…',
  accent = 'sky',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  accent?: 'sky' | 'rose' | 'fuchsia'
  className?: string
}) {
  const a = ACCENTS[accent]
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 rounded-full border ${a.border} bg-white/80 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${a.focus} transition-all`}
      />
    </div>
  )
}
