// src/components/sections/Hero.tsx
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, Brain, Sparkles } from 'lucide-react'
import { hero } from '@/lib/data'

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
        }
      },
      { threshold: 0.1 }
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center section-padding pt-24">
      <div className="container-custom">
        <div
          ref={textRef}
          className="text-center opacity-0 translate-y-8 transition-all duration-1000"
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
              className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              {hero.primaryButton.label}
            </Link>
            <Link
              href={hero.secondaryButton.href}
              className="px-8 py-3 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {hero.secondaryButton.label}
            </Link>
          </div>

          <div className="mt-16 animate-bounce-slow">
            <ArrowDown size={24} className="text-slate-400 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}