// src/components/ui/DailyThemeBackground.tsx
// 每日主题背景：根据当天日期在 7 套柔和浅色主题间轮换，实现“整体背景每天风格变化”。
// 挂载后通过修改 body 的 background-image 应用当天渐变，并渲染两个随主题变色的柔光球
// + 神经元背景（粒子颜色随主题）。SSR 阶段不渲染装饰内容，避免闪烁与 hydration 不一致。
'use client'

import { useEffect, useState } from 'react'
import { DAILY_THEMES, getDailyTheme } from '@/lib/daily-theme'
import NeuronBackground from './NeuronBackground'

export default function DailyThemeBackground() {
  const [theme, setTheme] = useState<(typeof DAILY_THEMES)[number] | null>(null)

  useEffect(() => {
    const t = getDailyTheme()
    setTheme(t)
    // 直接改 body 渐变，让“整体背景”随日期变化（SSR 首帧 body 仍是默认渐变）
    document.body.style.backgroundImage = t.background
    document.body.style.backgroundColor = t.base
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {theme && (
        <>
          {/* 右上柔光球（随主题变色，缓慢漂浮） */}
          <div
            className={`absolute -top-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br ${theme.orb1} blur-3xl animate-float`}
          />
          {/* 左下柔光球（随主题变色，反向缓慢漂浮） */}
          <div
            className={`absolute -bottom-28 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr ${theme.orb2} blur-3xl animate-float-delayed`}
          />
        </>
      )}
      {/* 神经元连线粒子背景（颜色随主题） */}
      <NeuronBackground rgb={theme?.rgb ?? '99,102,241'} />
    </div>
  )
}
