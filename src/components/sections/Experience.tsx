// src/components/sections/Experience.tsx
// “知识库”区块：知识总结以卡片形式展示，点击每张卡片进入 /knowledge/{id} 详情页
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import KnowledgeIllustration from '@/components/sections/KnowledgeIllustration'
import { experience } from '@/lib/data'

export default function Experience() {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll
    ? experience.items
    : experience.items.slice(0, experience.visibleCount)

  return (
    <Section id="experience" variant="sky" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={experience.title}
          subtitle={experience.subtitle}
          badge={experience.badge}
          index="03"
        />

        <div className="grid lg:grid-cols-3 gap-8 items-start mt-8">
          {/* 知识卡片（左侧 2/3） */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="grid sm:grid-cols-2 gap-6">
              {displayed.map((item) => (
                <Link
                  key={item.id}
                  href={`/knowledge/${item.id}`}
                  className="group block h-full"
                >
                  <Card className="h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-sky-600 bg-sky-50/80 rounded-full px-2.5 py-1 border border-sky-200/50">
                          {item.category}
                        </span>
                        {item.updated && (
                          <span className="text-xs text-slate-400">{item.updated}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20">
                          <BookOpen size={15} />
                        </span>
                        <h3 className="text-base font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
                        {item.summary}
                      </p>

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

                      <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-sky-600 font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        {experience.detailLinkLabel}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* 知识库插画（右侧 1/3，吸附跟随） */}
          <div className="lg:order-2 lg:sticky lg:top-24 self-start flex justify-center">
            <KnowledgeIllustration />
          </div>
        </div>

        {experience.items.length > experience.visibleCount && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {showAll ? experience.showLessLabel : experience.showMoreLabel}
            </button>
          </div>
        )}
      </div>
    </Section>
  )
}