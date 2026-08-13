// src/components/ui/FloatingChips.tsx
// 插画上的漂浮玻璃徽章：顶部标签 + 底部标签 + 中间星星。
// 5 个区块插画共用（仅 side / 颜色 / 图标 / 文案 不同），消除重复 JSX。
import { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

export interface FloatingChip {
  icon: ReactNode
  label: string
  /** 定位类，如 'top-4' / 'bottom-10' */
  position: string
  /** 动画类，如 'animate-float' / 'animate-float-delayed' */
  animation: string
  /** 文字颜色，如 'text-sky-600' */
  textColor: string
  /** 图标圆形渐变起始，如 'from-sky-500' */
  gradientFrom: string
  /** 图标圆形渐变结束，如 'to-indigo-500' */
  gradientTo: string
}

export default function FloatingChips({
  side = 'right',
  chips,
  sparkleColor,
}: {
  /** 徽章外露所在侧：'right' → 靠右（-right-2 sm:right-0），'left' → 靠左 */
  side?: 'left' | 'right'
  chips: FloatingChip[]
  /** 中间星星颜色，如 'text-sky-500' */
  sparkleColor: string
}) {
  const edge = side === 'right' ? '-right-2 sm:right-0' : '-left-2 sm:left-0'
  const sparkleEdge = side === 'right' ? '-right-4' : '-left-4'
  return (
    <>
      {chips.map((c) => (
        <div
          key={c.label}
          className={`absolute ${c.position} ${edge} ${c.animation} glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium ${c.textColor} shadow-md`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${c.gradientFrom} ${c.gradientTo} text-white`}
          >
            {c.icon}
          </span>
          {c.label}
        </div>
      ))}
      <div
        className={`absolute top-1/2 ${sparkleEdge} hidden sm:flex animate-wiggle glass-card rounded-full p-2 ${sparkleColor} shadow-md`}
      >
        <Sparkles size={14} />
      </div>
    </>
  )
}
