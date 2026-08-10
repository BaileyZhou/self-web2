// src/components/ui/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { nav } from '@/lib/data'
import { smoothScrollTo } from '@/lib/scroll'
import { pager } from '@/lib/pager'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // 当前处于视口内的区块（用于导航高亮特效）
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 翻页模式（首页卡片）：高亮跟随 pager 当前卡片
  useEffect(() => {
    return pager.subscribe((id) => {
      setActiveSection(`#${id}`)
      setIsScrolled(id !== 'hero')
    })
  }, [])

  // 非翻页模式（如知识库详情页）：根据滚动位置高亮导航项
  useEffect(() => {
    const sectionIds = nav.items
      .map((item) => item.href)
      .filter((href) => href.startsWith('#'))
      .map((href) => href.slice(1))

    const probe = 160 // 探测线位置（导航栏下方）：区块顶部越过此线即视为“当前区块”
    const updateActiveSection = () => {
      if (pager.isActive()) return // 翻页模式下由 pager 驱动
      let current = ''
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= probe) {
          current = `#${id}`
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    return () => window.removeEventListener('scroll', updateActiveSection)
  }, [])

  // 导航点击：翻页模式下切到对应卡片；非翻页模式（知识库详情页）走平滑滚动
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 首页链接：翻页模式下回到第一张卡片
    if (href === '/') {
      if (pager.isActive()) {
        e.preventDefault()
        setMobileMenuOpen(false)
        pager.goTo('hero')
      }
      return
    }
    if (!href.startsWith('#')) return // 非锚点链接走默认跳转
    e.preventDefault()
    setMobileMenuOpen(false)
    if (pager.isActive()) {
      pager.goTo(href.slice(1))
    } else {
      smoothScrollTo(href)
      history.pushState(null, '', href)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm shadow-indigo-500/5 border-b border-white/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">🧠</span>
            </div>
            <span className="text-lg font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
              {nav.brand}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`text-sm transition-colors relative group ${
                  activeSection === item.href
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ${
                    activeSection === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors"
            aria-label="切换菜单"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-white/40 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {nav.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`block transition-colors py-1 ${
                  activeSection === item.href
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}