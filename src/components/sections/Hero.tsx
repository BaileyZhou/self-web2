// src/components/sections/Hero.tsx
'use client'

import Link from 'next/link'
import { ArrowDown, Brain, Sparkles } from 'lucide-react'
import { hero } from '@/lib/data'
import { pager } from '@/lib/pager'

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center section-padding pt-24">
      <div className="container-custom">
        {/* 用纯 CSS 动画淡入上浮（不依赖 IntersectionObserver，避免首屏不显现） */}
        <div className="text-center animate-fade-up"
        >
          {/* 装饰大脑轮廓 */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 blur-2xl bg-indigo-300/20 rounded-full animate-pulse-slow" />
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/30">
              <Brain size={36} className="text-indigo-500" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-500">{hero.badge}</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-800 leading-tight">
            {hero.titleLine1}
            <br />
            <span className="gradient-text">{hero.titleHighlight}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitleLine1}
            <br />
            {hero.subtitleLine2}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={hero.primaryButton.href}
              onClick={(e) => {
                e.preventDefault()
                pager.goTo(hero.primaryButton.href.replace('#', ''))
              }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              {hero.primaryButton.label}
            </Link>
            <Link
              href={hero.secondaryButton.href}
              onClick={(e) => {
                e.preventDefault()
                pager.goTo(hero.secondaryButton.href.replace('#', ''))
              }}
              className="px-8 py-3 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {hero.secondaryButton.label}
            </Link>
          </div>

          {/* 向下箭头：点击后切到“关于我”卡片 */}
          <div className="mt-16 flex justify-center">
            <button
              type="button"
              onClick={() => pager.goTo('about')}
              aria-label="向下滚动到关于我"
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200/50 bg-white/60 text-slate-400 shadow-lg shadow-indigo-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-indigo-500/20 cursor-pointer"
            >
              <ArrowDown
                size={20}
                className="animate-bounce-slow group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}