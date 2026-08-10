// src/components/ui/ScrollProgress.tsx
// 页面右侧的滚动进度指示：一组对应各卡片的步骤圆点，
// 当前所在卡片的高亮为放大渐变紫，可点击跳转。
// 翻页模式（首页）下由 CardPager 驱动；知识库详情页没有翻页器时自动隐藏。
'use client'

import { useEffect, useState } from 'react'
import { pager, PAGER_PAGE_IDS } from '@/lib/pager'

export default function ScrollProgress() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = (id: string) => {
      setActiveIndex(PAGER_PAGE_IDS.indexOf(id as (typeof PAGER_PAGE_IDS)[number]))
      setVisible(true)
    }
    const unsub = pager.subscribe(update)
    if (pager.isActive()) update(pager.getCurrentId())
    return unsub
  }, [])

  // 没有翻页器（非首页）时不显示
  if (!visible) return null

  return (
    <div
      aria-hidden
      className="fixed right-1 md:right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-none"
    >
      <div className="flex flex-col items-center gap-2.5">
        {PAGER_PAGE_IDS.map((id, i) => (
          <button
            key={id}
            type="button"
            aria-label={`跳到 ${id} 区块`}
            onClick={() => pager.goTo(id)}
            className={`pointer-events-auto rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'h-3.5 w-3.5 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/40'
                : 'h-2.5 w-2.5 bg-slate-300/80 hover:bg-indigo-300 hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
