// src/components/sections/Experience.tsx
'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { experience } from '@/lib/data'

export default function Experience() {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll
    ? experience.items
    : experience.items.slice(0, experience.visibleCount)

  return (
    <section id="experience" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={experience.title}
          subtitle={experience.subtitle}
          badge={experience.badge}
        />

        <div className="space-y-6 mt-8">
          {displayed.map((exp) => (
            <Card key={exp.id} className="border-l-4 border-l-indigo-400/50">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{exp.title}</h3>
                      <p className="text-sm text-indigo-600">{exp.organization}</p>
                    </div>
                    <span className="text-sm text-slate-400 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-slate-600 text-sm">
                    {exp.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
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
    </section>
  )
}