// src/components/ui/CardPager.tsx
// 卡片翻页容器：把首页与五个内容区块做成一张张全屏卡片，
// 卡片之间以淡入淡出过渡；滚轮/键盘/触摸在“当前卡片内容到底后继续下拉”时切换到下一张。
// 每张内容卡片底部渲染页脚；各卡片内部组件（查看更多等交互）保持不变。
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Experience from '@/components/sections/Experience'
import Papers from '@/components/sections/Papers'
import CodeExamples from '@/components/sections/CodeExamples'
import Footer from '@/components/ui/Footer'
import { pager } from '@/lib/pager'
import type { KnowledgeItem } from '@/lib/knowledge-types'
import type { PaperItem } from '@/lib/papers-types'
import type { CodeFlowItem } from '@/lib/code-examples-types'

/** 旧卡片完全淡出时长（毫秒）：淡出完成后再让新卡片淡入，杜绝两页混叠 */
const FADE_OUT_MS = 320
/** 新卡片淡入时长（毫秒） */
const FADE_IN_MS = 420
/** 总过渡时长（busyRef 输入锁）：旧页淡出 + 新页淡入 */
const TRANSITION_MS = FADE_OUT_MS + FADE_IN_MS

export default function CardPager({
  experienceItems = [],
  papersItems = [],
  codeFlowItems = [],
}: {
  experienceItems?: KnowledgeItem[]
  papersItems?: PaperItem[]
  codeFlowItems?: CodeFlowItem[]
}) {
  const [current, setCurrent] = useState(0)
  // 正在淡出的旧卡片索引
  const [leaving, setLeaving] = useState<number | null>(null)
  // 过渡阶段：'out' = 旧页淡出（新页隐藏等待）；'in' = 新页淡入（旧页已消失）；null = 空闲
  const [phase, setPhase] = useState<'out' | 'in' | null>(null)
  // 已挂载的卡片索引：首屏只挂载 hero，其余卡片首次进入时再按需挂载，
  // 显著缩短首屏 DOM/hydration 时间，避免首载期间页面不可交互。
  const [mounted, setMounted] = useState<number[]>([0])
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([])
  const currentRef = useRef(0)
  const busyRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 卡片列表：id 需与 PAGER_PAGE_IDS 保持一致；首页不带页脚，内容卡片带页脚。
  // experienceItems 由服务端首页读取后传入（首页知识库展示最新 N 条），仅在变化时重建。
  const PAGES = useMemo(
    () =>
      [
        { id: 'hero', Comp: Hero, showFooter: false },
        { id: 'about', Comp: About, showFooter: true },
        { id: 'projects', Comp: Projects, showFooter: true },
        { id: 'experience', Comp: Experience, showFooter: true, items: experienceItems },
        { id: 'papers', Comp: Papers, showFooter: true, items: papersItems },
        { id: 'code-examples', Comp: CodeExamples, showFooter: true, items: codeFlowItems },
      ] as const,
    [experienceItems, papersItems, codeFlowItems]
  )

  const goTo = useCallback((index: number) => {
    if (busyRef.current || index === currentRef.current) return
    if (index < 0 || index >= PAGES.length) return

    busyRef.current = true
    setLeaving(currentRef.current) // 标记旧卡片，开始淡出
    setPhase('out') // 淡出阶段：新卡片保持隐藏，等待旧页完全消失
    currentRef.current = index
    setCurrent(index)
    // 首次进入某张卡片时按需挂载（先挂载再淡入，避免一直渲染全部 6 张卡片）
    setMounted((prev) => (prev.includes(index) ? prev : [...prev, index]))
    pager.setCurrentId(PAGES[index].id)
    // 新卡片内容回到顶部
    const el = scrollRefs.current[index]
    if (el) el.scrollTop = 0
    // 旧卡片淡出完成后 → 新卡片开始淡入
    window.setTimeout(() => setPhase('in'), FADE_OUT_MS)
    // 整体过渡结束 → 解锁并复位
    window.setTimeout(() => {
      busyRef.current = false
      setLeaving(null)
      setPhase(null)
    }, TRANSITION_MS)
  }, [PAGES])

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

    // 处理地址栏 hash：深链接（/#about 等）、冷加载时 hash 延迟设置、以及浏览器前进/后退
    const goToHash = () => {
      const hash = window.location.hash.replace('#', '')
      const idx = PAGES.findIndex((p) => p.id === hash)
      if (idx > 0) {
        goTo(idx)
      } else if (!hash) {
        // 无深链接时以首页为基线：清除上次会话残留的 currentId，
        // 避免从其它页面返回时导航高亮（如“知识库”）与可见卡片（首页）失步。
        pager.resetToHero()
      }
    }
    goToHash()
    window.addEventListener('hashchange', goToHash)

    return () => {
      pager.unregister()
      window.removeEventListener('hashchange', goToHash)
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
        // 按需挂载：未访问过的卡片不渲染，缩短首屏 hydration、提高首载可交互性
        if (!mounted.includes(i)) return null
        const isLeaving = i === leaving && i !== current
        const isCurrent = i === current
        // 当前卡片：淡入阶段（'in'）或空闲（null）时可见；淡出阶段（'out'）隐藏等待
        const currentVisible = isCurrent && (phase === 'in' || phase === null)
        let cls = 'absolute inset-0 transition-opacity ease-out'
        if (isLeaving) {
          // 旧卡片：完全淡出（结束后新卡片才开始淡入，杜绝两页混叠）
          cls += ' duration-[320ms] opacity-0 z-0 pointer-events-none'
        } else if (isCurrent) {
          // 新卡片：淡入阶段才显示，其余时间隐藏（等待旧页淡出完成）
          cls += ` duration-[420ms] ${
            currentVisible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`
        } else {
          cls += ' opacity-0 z-0 pointer-events-none pager-card-hidden'
        }
        return (
          <div key={page.id} aria-hidden={!currentVisible} className={cls}>
            <div className="flex flex-col h-full">
              {/* 卡片内容区（可滚动），页脚固定在卡片底部 */}
              <div
                ref={(el) => {
                  scrollRefs.current[i] = el
                }}
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <div className="min-h-full">
                  {/* experience(知识库) / papers(论文) / code-examples(代码案例) 带各自的 items 类型，
                      按 id 显式渲染避免联合类型冲突；其余卡片无 props，走泛型渲染。 */}
                  {page.id === 'experience' ? (
                    <Experience items={experienceItems} />
                  ) : page.id === 'papers' ? (
                    <Papers items={papersItems} />
                  ) : page.id === 'code-examples' ? (
                    <CodeExamples items={codeFlowItems} />
                  ) : (
                    <page.Comp />
                  )}
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
