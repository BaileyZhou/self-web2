// src/components/ui/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  /** 悬停渐变填充（如 'from-sky-500 to-indigo-600'）：悬停时卡片背景由毛玻璃渐变为主题色 */
  hoverGradient?: string
}

export default function Card({ children, className = '', hover = true, hoverGradient }: CardProps) {
  return (
    <div className={`group relative ${className}`}>
      {/* 悬浮时的渐变描边层（在卡片四周浮现柔和光晕描边） */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-indigo-300/40 via-purple-300/30 to-sky-300/30 transition-opacity duration-300 ${
          hover ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`relative glass-card card-hover-smooth rounded-xl p-6 h-full transition-all duration-300 ${
          hover
            ? 'hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1.5 hover:border-indigo-200/70'
            : ''
        }`}
      >
        {/* 顶部内高光（玻璃质感） */}
        <div aria-hidden className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        {/* 内层柔光（自上而下的通透感，减弱白罩让玻璃更透） */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 via-white/5 to-transparent" />
        {/* 悬停渐变填充层（毛玻璃 → 主题色渐变） */}
        {hoverGradient && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />
        )}
        {/* 内容层（置于装饰层之上） */}
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}