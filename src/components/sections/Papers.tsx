// src/components/sections/Papers.tsx
'use client'

import { useState } from 'react'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { papers } from '@/lib/data'
import { FileText, ExternalLink } from 'lucide-react'

export default function Papers() {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll
    ? papers.items
    : papers.items.slice(0, papers.visibleCount)

  return (
    <Section id="papers" variant="rose" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={papers.title}
          subtitle={papers.subtitle}
          badge={papers.badge}
          index="04"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayed.map((paper) => (
            <Card key={paper.id} className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50/80 flex items-center justify-center">
                  <FileText size={18} className="text-indigo-500" />
                </div>
                <span className="text-xs font-medium text-indigo-500">{paper.journal}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-800 leading-snug">{paper.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{paper.summary}</p>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/80">
                <span className="text-xs text-slate-400">{paper.year}</span>
                <a
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  {papers.readLabel} <ExternalLink size={14} />
                </a>
              </div>
            </Card>
          ))}
        </div>

        {papers.items.length > papers.visibleCount && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {showAll ? papers.showLessLabel : papers.showMoreLabel}
            </button>
          </div>
        )}
      </div>
    </Section>
  )
}