// src/components/sections/Timeline.tsx
// 垂直时间线组件：把“项目与经历”按时间从上到下展示，
// 左侧一条渐变竖线 + 节点圆点，右侧为长条形玻璃卡片。
'use client'

import { ReactNode, useState } from 'react'
import { Briefcase, FolderKanban } from 'lucide-react'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'

// 时间线条目
interface TimelineItem {
  id: string
  /** 'work' 工作经历 / 'project' 项目经历（决定节点图标） */
  type?: string
  period: string
  title: string
  organization: string
  role?: string
  description?: string
  highlights?: string[]
  tags?: string[]
}

// 区块配置（与 data.ts 中 projects 的结构一致）
interface TimelineConfig {
  badge: string
  title: string
  subtitle: string
  visibleCount: number
  showMoreLabel: string
  showLessLabel: string
  items: TimelineItem[]
}

interface TimelineProps {
  /** 区块 id（用于锚点导航，如 'projects'） */
  id: string
  /** 区块内容配置（从 data.ts 传入） */
  config: TimelineConfig
  /** 可选插画（如项目插画），放在时间线一侧 */
  illustration?: ReactNode
  /** 插画位置：'left' 在左、'right' 在右（大屏生效） */
  illustrationSide?: 'left' | 'right'
  /** 主题色（对应 Section 组件） */
  variant: 'indigo' | 'violet' | 'sky' | 'rose' | 'fuchsia'
  /** 区块序号（水印数字） */
  index: string
}

export default function Timeline({
  id,
  config,
  variant,
  index,
  illustration,
  illustrationSide = 'right',
}: TimelineProps) {
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

        <div className="grid lg:grid-cols-2 gap-8 items-start mt-10">
          {/* 插画列（大屏吸附跟随，移动端在时间线上方） */}
          {illustration && (
            <div
              className={`flex justify-center lg:sticky lg:top-24 self-start ${
                illustrationSide === 'left' ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              {illustration}
            </div>
          )}

          {/* 时间线列 */}
          <div className={illustration ? (illustrationSide === 'left' ? 'lg:order-2' : 'lg:order-1') : ''}>
        <div className="relative">
          {/* 左侧渐变竖线（时间轴线） */}
          <div
            aria-hidden
            className="absolute left-[17px] md:left-[21px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-500/50 via-purple-400/35 to-transparent rounded-full"
          />

          <div className="space-y-8">
            {displayed.map((item) => (
              <div key={item.id} className="relative pl-12 md:pl-16">
                {/* 时间线节点圆点 */}
                <span
                  aria-hidden
                  className="absolute left-[11px] md:left-[15px] top-6 h-[13px] w-[13px] rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-4 ring-violet-100/80 shadow-sm"
                />

                {/* 长条形卡片 */}
                <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200/70">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {/* 类型图标 */}
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/25">
                      {item.type === 'work' ? <Briefcase size={16} /> : <FolderKanban size={16} />}
                    </span>
                    {/* 时间区间 */}
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200/60">
                      {item.period}
                    </span>
                    {/* 类型标签 */}
                    <span className="ml-auto text-xs text-slate-400">
                      {item.type === 'work' ? '工作经历' : '学习经历'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-violet-600">
                    {item.organization}
                    {item.role ? ` · ${item.role}` : ''}
                  </p>

                  {item.description && (
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
                  )}

                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-slate-600 text-sm">
                      {item.highlights.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5">▸</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
        </div>
      </div>
    </Section>
  )
}
