// src/lib/pager.ts
// 卡片翻页控制器（单页站点翻页用）：
// CardPager 挂载时注册切换函数，Header / 进度点 / Hero 按钮等
// 即使不在 CardPager 的组件树内，也能通过它切换卡片。
// 注：知识库详情页没有 CardPager，此时 pager.isActive() 为 false，各组件回退到原有滚动行为。

export const PAGER_PAGE_IDS = [
  'hero',
  'about',
  'projects',
  'experience',
  'papers',
  'code-examples',
] as const

export type PagerPageId = (typeof PAGER_PAGE_IDS)[number]

type GoToFn = (id: PagerPageId) => void

let goToFn: GoToFn | null = null
let currentId: PagerPageId = 'hero'
const listeners = new Set<(id: PagerPageId) => void>()

export const pager = {
  /** 由 CardPager 挂载时注册切换函数；注册后会立即通知订阅者 */
  register(fn: GoToFn) {
    goToFn = fn
    listeners.forEach((l) => l(currentId))
  },
  unregister() {
    goToFn = null
  },
  isActive() {
    return !!goToFn
  },
  goTo(id: string) {
    const pageId = id as PagerPageId
    if (!PAGER_PAGE_IDS.includes(pageId)) return
    goToFn?.(pageId)
  },
  getCurrentId() {
    return currentId
  },
  /** 由 CardPager 在切换卡片后调用：通知订阅者并同步地址栏 hash */
  setCurrentId(id: PagerPageId) {
    currentId = id
    listeners.forEach((l) => l(id))
    const target = id === 'hero' ? '/' : `#${id}`
    history.replaceState(null, '', target)
  },
  subscribe(l: (id: PagerPageId) => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
