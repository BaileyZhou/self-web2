// src/components/ui/SectionHeader.tsx
interface SectionHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  /** 区块序号（如 "01"）：渲染为背景水印大数字，增强层次 */
  index?: string
}

export default function SectionHeader({ title, subtitle, badge, index }: SectionHeaderProps) {
  return (
    <div className="relative text-center mb-14">
      {/* 背景水印大数字（半透明渐变，营造纵深层次） */}
      {index && (
        <span
          aria-hidden
          className="absolute left-1/2 -top-14 -translate-x-1/2 text-[7rem] md:text-[9rem] font-bold leading-none select-none pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.02) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {index}
        </span>
      )}

      {badge && (
        <span className="relative inline-block px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50/80 rounded-full border border-indigo-200/50 mb-3">
          {badge}
        </span>
      )}
      <h2 className="relative text-3xl md:text-4xl font-semibold text-slate-800">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && <p className="relative mt-3 text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}

      {/* 标题下方的渐变装饰线 */}
      <div className="relative mt-6 flex items-center justify-center gap-1.5">
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
        <span className="h-1 w-2 rounded-full bg-indigo-300/70" />
        <span className="h-1 w-1.5 rounded-full bg-indigo-300/40" />
      </div>
    </div>
  )
}