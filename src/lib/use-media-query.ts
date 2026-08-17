// src/lib/use-media-query.ts
// 响应式查询 Hook：在客户端组件里判断当前视口是否匹配某条媒体查询（如 lg 断点）。
// 文库列表页用它决定交互方式：桌面（lg+）点击卡片=选中右侧浮窗预览；
// 平板/手机（<lg，右侧浮窗被隐藏）点击卡片=直接进入详情页，避免“只能点看不到详情”。
'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** 是否桌面尺寸（≥1024px，与 Tailwind 的 lg 断点一致；lg 以下浮窗隐藏） */
export function useIsLg(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
