// src/components/ui/DailyThemeBackground.tsx
// 每日主题背景：根据当天日期在 7 套柔和浅色主题间轮换，实现“整体背景每天风格变化”。
// 挂载后通过修改 body 的 background-image 应用当天渐变，并渲染两个随主题变色的柔光球
// + 神经元背景（粒子颜色随主题）。SSR 阶段不渲染装饰内容，避免闪烁与 hydration 不一致。
// 首帧后应用背景并让柔光球淡入：避免首载同帧做「大尺寸 blur 柔光球 + 整页背景重绘」
// 抢占主线程导致首帧卡顿、输入（滚轮/导航）无响应。
'use client'

import { useEffect, useState } from 'react'
import { DAILY_THEMES, getDailyTheme } from '@/lib/daily-theme'
import NeuronBackground from './NeuronBackground'

export default function DailyThemeBackground() {
  const [theme, setTheme] = useState<(typeof DAILY_THEMES)[number] | null>(null)
  // 首帧后才置为 true：柔光球淡入、背景渐变应用都延迟到首帧之后
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = getDailyTheme()
    // 先用 rAF 让首帧先交付出（页面立即可交互），下一帧再应用背景与柔光球
    const raf = requestAnimationFrame(() => {
      document.body.style.backgroundImage = t.background
      document.body.style.backgroundColor = t.base
      setTheme(t)
      // 再隔一帧开始淡入（避免与背景重绘挤在同一帧）
      requestAnimationFrame(() => setReady(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {theme && (
        <>
          {/* 右上柔光球（随主题变色，缓慢漂浮；首帧后淡入，降低首绘成本） */}
          <div
            className={`absolute -top-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br ${theme.orb1} blur-2xl animate-float transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* 左下柔光球（随主题变色，反向缓慢漂浮） */}
          <div
            className={`absolute -bottom-28 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr ${theme.orb2} blur-2xl animate-float-delayed transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}
      {/* 神经元连线粒子背景（颜色随主题；首帧后再启动） */}
      <NeuronBackground rgb={theme?.rgb ?? '99,102,241'} paused={!ready} />
    </div>
  )
}
