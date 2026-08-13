// src/components/ui/LayeredContent.tsx
// 双层内容容器：把「卡通插画」作为底层（桌面端放大、倾斜、位于一侧），
// 内容卡片作为顶层（毛玻璃、悬浮其上，仅与插画边缘微叠）——形成两个图层的层次感，
// 同时让插画边缘的悬浮文字徽章保持外露可见。
// 移动端：插画回到文档流显示在内容下方，避免重叠挤压与杂乱。
import { ReactNode } from 'react'

export default function LayeredContent({
  illustration,
  children,
  className = '',
  side = 'left',
}: {
  illustration?: ReactNode
  children: ReactNode
  className?: string
  /** 插画所在侧（桌面端）：'left' 插画靠左、卡片靠右；'right' 反之 */
  side?: 'left' | 'right'
}) {
  const isRight = side === 'right'
  return (
    <div className={`relative ${className}`}>
      {/* 底层：放大 + 倾斜的卡通插画（桌面端位于一侧、徽章外露；移动端隐藏）。
          置于卡片之前渲染：即使 CSS 尚未就绪，后绘制的卡片也会自然覆盖其上，
          避免加载时卡通先浮在卡片上再跳到底层的闪现。 */}
      {illustration && (
        <div
          aria-hidden
          className={`absolute inset-0 z-0 isolate pointer-events-none hidden lg:flex items-center illustration-fade-in ${
            isRight ? 'justify-end' : 'justify-start'
          } ${isRight ? 'lg:pr-8' : 'lg:pl-8'} lg:pt-6`}
        >
          <div
            className={`w-full max-w-sm mx-auto lg:w-[30rem] lg:max-w-none lg:mx-0 lg:opacity-95 [&>*]:!max-w-none ${
              isRight ? 'lg:rotate-3' : 'lg:-rotate-3'
            }`}
          >
            {illustration}
          </div>
        </div>
      )}

      {/* 顶层：毛玻璃内容卡片（偏移给底层插画留出外露区，仅边缘微叠）。
          translateZ(0) 强制卡片提升为独立合成层，动画/淡入期间也始终排在插画之上。 */}
      <div className={`relative z-10 isolate [transform:translateZ(0)] ${isRight ? 'lg:pr-[20rem]' : 'lg:pl-[20rem]'}`}>{children}</div>
    </div>
  )
}

