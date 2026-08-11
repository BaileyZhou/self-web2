// src/components/ui/ReadingProgress.tsx
// 阅读进度条：随页面滚动填充，展示当前阅读到文章的百分比。
'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    // 直接监听滚动更新（不依赖 rAF，避免后台/嵌入式环境卡死）
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-slate-200/40">
      <div
        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  )
}
