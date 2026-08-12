// src/lib/daily-theme.ts
// 每日主题：网站整体背景按日期每日轮换风格（7 套柔和浅色主题循环）。
// 纯函数 + 静态数据，可在客户端组件中安全使用（服务端渲染时返回默认，挂载后再应用当天主题）。

export interface DailyTheme {
  key: string
  /** 主题名（可展示给用户） */
  name: string
  /** body 背景渐变（CSS background-image，随日期切换） */
  background: string
  /** body 回退背景色 */
  base: string
  /** 右上柔光球（Tailwind 渐变类） */
  orb1: string
  /** 左下柔光球（Tailwind 渐变类） */
  orb2: string
  /** 神经元粒子的 RGB（不含 alpha，逗号分隔） */
  rgb: string
}

/** 7 套主题：从默认的靛蓝紫出发，覆盖冷暖多种柔和浅色，保证每天视觉都不同又整体协调 */
export const DAILY_THEMES: DailyTheme[] = [
  {
    key: 'indigo',
    name: '靛蓝紫',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #faf5ff 100%)',
    base: '#f8fafc',
    orb1: 'from-indigo-300/30 to-purple-300/20',
    orb2: 'from-sky-200/40 to-indigo-200/30',
    rgb: '99,102,241',
  },
  {
    key: 'sky',
    name: '晴空蓝',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 45%, #eef2ff 100%)',
    base: '#f0f9ff',
    orb1: 'from-sky-300/30 to-cyan-300/20',
    orb2: 'from-teal-200/40 to-sky-200/30',
    rgb: '14,165,233',
  },
  {
    key: 'violet',
    name: '紫藤紫',
    background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 45%, #fdf4ff 100%)',
    base: '#faf5ff',
    orb1: 'from-violet-300/30 to-fuchsia-300/20',
    orb2: 'from-indigo-200/40 to-violet-200/30',
    rgb: '139,92,246',
  },
  {
    key: 'rose',
    name: '玫瑰粉',
    background: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 45%, #faf5ff 100%)',
    base: '#fff1f2',
    orb1: 'from-rose-300/30 to-pink-300/20',
    orb2: 'from-pink-200/40 to-rose-200/30',
    rgb: '244,63,94',
  },
  {
    key: 'teal',
    name: '青碧绿',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 45%, #f8fafc 100%)',
    base: '#f0fdfa',
    orb1: 'from-teal-300/30 to-emerald-300/20',
    orb2: 'from-cyan-200/40 to-teal-200/30',
    rgb: '20,184,166',
  },
  {
    key: 'amber',
    name: '暖阳橙',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 45%, #fff1f2 100%)',
    base: '#fffbeb',
    orb1: 'from-amber-300/30 to-orange-300/20',
    orb2: 'from-rose-200/40 to-amber-200/30',
    rgb: '245,158,11',
  },
  {
    key: 'fuchsia',
    name: '晚霞粉',
    background: 'linear-gradient(135deg, #fdf4ff 0%, #fdf2f8 45%, #eef2ff 100%)',
    base: '#fdf4ff',
    orb1: 'from-fuchsia-300/30 to-purple-300/20',
    orb2: 'from-rose-200/40 to-fuchsia-200/30',
    rgb: '217,70,239',
  },
]

/** 取当天主题：按自然日从纪元起滚动取模，保证每天都不同、7 天一轮回 */
export function getDailyTheme(date: Date = new Date()): DailyTheme {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.floor(start.getTime() / 86_400_000)
  return DAILY_THEMES[((days % DAILY_THEMES.length) + DAILY_THEMES.length) % DAILY_THEMES.length]
}
