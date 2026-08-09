// src/lib/scroll.ts
// 页面锚点平滑滚动工具：为导航跳转提供流畅的过渡动画，替代生硬的瞬间跳转

/** 固定导航栏高度 + 预留留白（px）：滚动停靠点会停在目标上方这个距离 */
const HEADER_OFFSET = 80
/** 滚动动画时长（毫秒） */
const SCROLL_DURATION = 650

/** 缓动函数：easeInOutCubic —— 先加速后减速，观感自然不生硬 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * 平滑滚动到页面内某个锚点
 * @param hash 形如 '#about' 的锚点字符串
 */
export function smoothScrollTo(hash: string): void {
  if (!hash || hash === '#') return
  const id = hash.replace(/^#/, '')
  const target = document.getElementById(id)
  if (!target) return

  const startY = window.scrollY
  const rawTargetY = target.getBoundingClientRect().top + startY - HEADER_OFFSET
  // 防止滚过头（例如目标靠近页面底部时）
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const targetY = Math.max(0, Math.min(rawTargetY, maxScroll))
  const distance = targetY - startY

  // 尊重系统“减少动态效果”设置：直接跳转，不做动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY)
    return
  }

  let startTime: number | null = null

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / SCROLL_DURATION, 1)
    window.scrollTo(0, startY + distance * easeInOutCubic(progress))
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}
