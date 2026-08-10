// src/components/sections/ProjectGrid.tsx
// 可复用的“项目式卡片”网格：项目区块与代码案例区块共用，以项目为模块展示
'use client'

import { ReactNode, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'

// 卡片条目（项目 / 代码案例通用结构）
interface GridItem {
  id: string
  title: string
  description: string
  category: string
  status?: string
  image?: string
  tags?: string[]
  link?: string
}

// 区块配置（与 data.ts 中 projects / codeExamples 的结构一致）
interface GridSectionConfig {
  badge: string
  title: string
  subtitle: string
  visibleCount: number
  showMoreLabel: string
  showLessLabel: string
  detailLinkLabel?: string
  items: GridItem[]
}

interface ProjectGridProps {
  /** 区块 id（用于锚点导航，如 'projects' / 'code-examples'） */
  id: string
  /** 区块内容配置（从 data.ts 传入） */
  config: GridSectionConfig
  /** 主题色（对应 Section 组件） */
  variant: 'indigo' | 'violet' | 'sky' | 'rose' | 'fuchsia'
  /** 区块序号（水印数字） */
  index: string
  /** 可选插画，放在卡片网格一侧 */
  illustration?: ReactNode
  /** 插画位置：'left' 在左、'right' 在右（大屏生效） */
  illustrationSide?: 'left' | 'right'
}

export default function ProjectGrid({
  id,
  config,
  variant,
  index,
  illustration,
  illustrationSide = 'right',
}: ProjectGridProps) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? config.items : config.items.slice(0, config.visibleCount)

  return (
    <Section id={id} variant={variant} className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={config.title}
          subtitle={config.subtitle}
          badge={config.badge}
          index={index}
        />

        <div className="grid lg:grid-cols-3 gap-8 items-start mt-8">
          {/* 插画列（大屏吸附跟随，移动端在卡片下方） */}
          {illustration && (
            <div
              className={`flex justify-center lg:sticky lg:top-24 self-start ${
                illustrationSide === 'left' ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              {illustration}
            </div>
          )}

          {/* 卡片列 */}
          <div
            className={`${illustration ? 'lg:col-span-2' : 'lg:col-span-3'} ${
              illustration ? (illustrationSide === 'left' ? 'lg:order-2' : 'lg:order-1') : ''
            }`}
          >
            <div
              className={
                illustration
                  ? 'grid sm:grid-cols-2 gap-6'
                  : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            >
              {displayed.map((item) => (
                <Card key={item.id} className="flex flex-col h-full">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-indigo-50/50">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <Brain size={48} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-500">{item.category}</span>
                      {item.status && <span className="text-xs text-slate-400">· {item.status}</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {config.detailLinkLabel && (
                    <Link
                      href={item.link || '#'}
                      target={item.link?.startsWith('http') ? '_blank' : undefined}
                      rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                    >
                      {config.detailLinkLabel}
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {config.items.length > config.visibleCount && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {showAll ? config.showLessLabel : config.showMoreLabel}
            </button>
          </div>
        )}
      </div>
    </Section>
  )
}
