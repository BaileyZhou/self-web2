// src/components/ui/SectionHeader.tsx
interface SectionHeaderProps {
  title: string
  subtitle?: string
  badge?: string
}

export default function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12">
      {badge && (
        <span className="inline-block px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50/80 rounded-full border border-indigo-200/50 mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-slate-800">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && <p className="mt-3 text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}