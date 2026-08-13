// src/components/sections/AboutIllustration.tsx
// “关于我”区块插画：直接使用用户提供的卡通人物图片（public/about/image.png），
// 以圆形框架展示（与其它区块“渐变圆底座 + 虚线环”风格一致）：
// 图片在圆内裁剪聚焦面部/上半身，仅通过 CSS filter + 柔和紫色叠色调整颜色；
// 保留背后的柔光、虚线环与悬浮玻璃徽章。
import { Brain, Lightbulb } from 'lucide-react'
import FloatingChips from '@/components/ui/FloatingChips'

export default function AboutIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square select-none" aria-hidden>
      {/* 主光晕（人物背后柔和发光的层次） */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-200/60 via-purple-200/40 to-sky-200/50 blur-2xl" />

      {/* 圆形框架：用户提供的卡通人物图片（颜色已调整贴合页面风格） */}
      <div className="relative w-full h-full drop-shadow-xl">
        <div className="absolute inset-0 rounded-full overflow-hidden ring-1 ring-white/60 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about/image.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'hue-rotate(12deg) saturate(1.05)', objectPosition: '50% 22%' }}
          />
          {/* 柔和紫色叠色（soft-light），统一整体色调 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                'linear-gradient(135deg, rgba(129,140,248,0.28), rgba(168,85,247,0.12) 60%, rgba(56,189,248,0.12))',
            }}
          />
        </div>
        {/* 装饰虚线环（与其它区块插画的虚线环呼应） */}
        <div className="absolute -inset-2 rounded-full border-2 border-dashed border-indigo-300/60" />
      </div>

      {/* 漂浮玻璃徽章（层次感，沿用 glass-card 风格） */}
      <FloatingChips
        side="right"
        sparkleColor="text-indigo-500"
        chips={[
          { icon: <Brain size={12} />, label: '脑科学', position: 'top-4', animation: 'animate-float', textColor: 'text-indigo-600', gradientFrom: 'from-indigo-500', gradientTo: 'to-purple-500' },
          { icon: <Lightbulb size={12} />, label: '产品思维', position: 'bottom-10', animation: 'animate-float-delayed', textColor: 'text-purple-600', gradientFrom: 'from-purple-500', gradientTo: 'to-pink-500' },
        ]}
      />
    </div>
  )
}
