// src/components/ui/CardPager.tsx
// 卡片翻页容器：把首页与五个内容区块做成一张张全屏卡片，
// 卡片之间以淡入淡出过渡；滚轮/键盘/触摸在“当前卡片内容到底后继续下拉”时切换到下一张。
// 每张内容卡片底部渲染页脚；各卡片内部组件（查看更多等交互）保持不变。
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Experience from '@/components/sections/Experience'
import Papers from '@/components/sections/Papers'
import CodeExamples from '@/components/sections/CodeExamples'
import Footer from '@/components/ui/Footer'
import { pager } from '@/lib/pager'

// 卡片列表：id 需与 PAGER_PAGE_IDS 保持一致；首页不带页脚，内容卡片带页脚
const PAGES = [
  { id: 'hero', Comp: Hero, showFooter: false },
  { id: 'about', Comp: About, showFooter: true },
  { id: 'projects', Comp: Projects, showFooter: true },
  { id: 'experience', Comp: Experience, showFooter: true },
  { id: 'papers', Comp: Papers, showFooter: true },
  { id: 'code-examples', Comp: CodeExamples, showFooter: true },
] as const

/** 卡片切换过渡时长（毫秒） */
const TRANSITION_MS = 650

export default function CardPager() {
  const [current, setCurrent] = useState(0)
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([])
  const currentRef = useRef(0)
  const busyRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    if (busyRef.current || index === currentRef.current) return
    if (index < 0 || index >= PAGES.length) return

    busyRef.current = true
    currentRef.current = index
    setCurrent(index)
    pager.setCurrentId(PAGES[index].id)
    // 新卡片内容回到顶部
    const el = scrollRefs.current[index]
    if (el) el.scrollTop = 0
    window.setTimeout(() => {
      busyRef.current = false
    }, TRANSITION_MS)
  }, [])

  // 挂载：锁定页面滚动、注册到全局 pager、处理初始 hash（如 /#experience）
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    pager.register((id) => {
      const idx = PAGES.findIndex((p) => p.id === id)
      if (idx >= 0) goTo(idx)
    })

    const hash = window.location.hash.replace('#', '')
    const idx = PAGES.findIndex((p) => p.id === hash)
    if (idx > 0) goTo(idx)

    return () => {
      pager.unregister()
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [goTo])

  // 键盘翻页（PageDown/PageUp）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'PageDown') {
        e.preventDefault()
        goTo(currentRef.current + 1)
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        goTo(currentRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  // 滚轮翻页：当前卡片内容到底后继续下滚 → 下一张；滚回顶部继续上滚 → 上一张
  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (busyRef.current) {
        e.preventDefault()
        return
      }
      // 只在翻页容器内部滚动时接管，避免影响固定导航等区域
      if (!containerRef.current?.contains(e.target as Node)) return

      const el = scrollRefs.current[currentRef.current]
      const delta = e.deltaY
      if (delta > 0) {
        // 内容还没到底 → 让当前卡片内部正常滚动
        if (el && el.scrollTop + el.clientHeight < el.scrollHeight - 4) return
        goTo(currentRef.current + 1)
      } else if (delta < 0) {
        if (el && el.scrollTop > 4) return
        goTo(currentRef.current - 1)
      }
      e.preventDefault()
    },
    [goTo]
  )

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // 触摸翻页（移动端滑动）
  const touchStartY = useRef<number | null>(null)
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return
      const dy = e.changedTouches[0].clientY - touchStartY.current
      touchStartY.current = null
      if (busyRef.current || Math.abs(dy) < 40) return
      const el = scrollRefs.current[currentRef.current]
      if (dy < 0) {
        if (el && el.scrollTop + el.clientHeight < el.scrollHeight - 4) return
        goTo(currentRef.current + 1)
      } else {
        if (el && el.scrollTop > 4) return
        goTo(currentRef.current - 1)
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [goTo])

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {PAGES.map((page, i) => {
        const active = i === current
        return (
          <div
            key={page.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[650ms] ease-in-out ${
              active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* 卡片内容区（可滚动），页脚固定在卡片底部 */}
              <div
                ref={(el) => {
                  scrollRefs.current[i] = el
                }}
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <div className="min-h-full">
                  <page.Comp />
                </div>
              </div>
              {page.showFooter && <Footer />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
