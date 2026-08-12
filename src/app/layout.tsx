// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/ui/Header'
import DailyThemeBackground from '@/components/ui/DailyThemeBackground'
import ScrollProgress from '@/components/ui/ScrollProgress'
import { siteContent } from '@/lib/data'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// 元数据来自 src/lib/data.ts 中的 site 配置
export const metadata: Metadata = {
  title: siteContent.site.title,
  description: siteContent.site.description,
  keywords: siteContent.site.keywords,
  authors: [{ name: siteContent.site.author }],
  openGraph: {
    title: siteContent.site.title,
    description: siteContent.site.description,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={siteContent.site.language} className={inter.variable}>
      <body className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 min-h-screen antialiased">
        <Header />
        {/* 右侧滚动进度条 */}
        <ScrollProgress />
        <main className="relative z-10">{children}</main>
        {/* 背景装饰：每日主题背景（整体背景随日期轮换风格） */}
        <DailyThemeBackground />
      </body>
    </html>
  )
}