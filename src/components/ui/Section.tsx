// src/components/ui/Section.tsx
// 区块容器：为每个模块提供统一的多层背景装饰（光晕 + 纹理 + 渐变线），营造层次感
import { ReactNode } from 'react'

interface SectionProps {
  id?: string
  className?: string
  /** 主题色：每个模块用同色系但略有差异的柔光，保持统一又避免单调 */
  variant?: 'indigo' | 'violet' | 'sky' | 'rose' | 'fuchsia'
  children: ReactNode
}

// 各主题的装饰色配置（与站点整体的靛蓝/紫配色体系保持一致）
const variantStyles = {
  indigo: {
    orb1: 'from-indigo-300/30 to-purple-300/20',
    orb2: 'from-sky-200/30 to-indigo-200/20',
    grid: 'rgba(99,102,241,0.05)',
    hairline: 'from-indigo-500/40 via-purple-500/30 to-transparent',
  },
  violet: {
    orb1: 'from-violet-300/30 to-fuchsia-300/20',
    orb2: 'from-indigo-200/30 to-violet-200/20',
    grid: 'rgba(139,92,246,0.05)',
    hairline: 'from-violet-500/40 via-fuchsia-500/30 to-transparent',
  },
  sky: {
    orb1: 'from-sky-300/30 to-indigo-300/20',
    orb2: 'from-teal-200/30 to-sky-200/20',
    grid: 'rgba(56,189,248,0.05)',
    hairline: 'from-sky-500/40 via-indigo-500/30 to-transparent',
  },
  rose: {
    orb1: 'from-rose-300/25 to-purple-300/20',
    orb2: 'from-pink-200/30 to-rose-200/20',
    grid: 'rgba(244,114,182,0.05)',
    hairline: 'from-rose-500/40 via-purple-500/30 to-transparent',
  },
  fuchsia: {
    orb1: 'from-fuchsia-300/30 to-purple-300/20',
    orb2: 'from-violet-200/30 to-fuchsia-200/20',
    grid: 'rgba(217,70,239,0.05)',
    hairline: 'from-fuchsia-500/40 via-purple-500/30 to-transparent',
  },
}

export default function Section({
  id,
  className = '',
  variant = 'indigo',
  children,
}: SectionProps) {
  const v = variantStyles[variant] ?? variantStyles.indigo

  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      {/* 背景装饰层（绝对定位在内容之下，营造纵深） */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {/* 右上柔光球（缓慢漂浮） */}
        <div
          className={`absolute -top-28 -right-20 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br ${v.orb1} blur-3xl animate-float`}
        />
        {/* 左下柔光球（缓慢漂浮，方向相反） */}
        <div
          className={`absolute -bottom-24 -left-28 w-[24rem] h-[24rem] rounded-full bg-gradient-to-tr ${v.orb2} blur-3xl animate-float-delayed`}
        />
        {/* 细微点阵纹理（低调的重复图案） */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${v.grid} 1px, transparent 0)`,
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* 顶部渐变发丝线（区块之间的分隔层次） */}
      <div aria-hidden className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r ${v.hairline}`} />

      {/* 内容层（置于装饰层之上） */}
      <div className="relative">{children}</div>
    </section>
  )
}
