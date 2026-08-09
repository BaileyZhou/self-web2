// src/components/sections/Projects.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { projects } from '@/lib/data'

export default function Projects() {
  const [showAll, setShowAll] = useState(false)
  const displayedProjects = showAll
    ? projects.items
    : projects.items.slice(0, projects.visibleCount)

  return (
    <section id="projects" className="section-padding bg-white/30 backdrop-blur-sm border-y border-white/40">
      <div className="container-custom">
        <SectionHeader
          title={projects.title}
          subtitle={projects.subtitle}
          badge={projects.badge}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayedProjects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-indigo-50/50">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-300">
                    <Brain size={48} />
                  </div>
                )}
              </div>
              <div className="flex-1 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-indigo-500">{project.category}</span>
                  {project.status && (
                    <span className="text-xs text-slate-400">· {project.status}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{project.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100/80 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={project.link || '#'}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
              >
                {projects.detailLinkLabel}
              </Link>
            </Card>
          ))}
        </div>

        {projects.items.length > projects.visibleCount && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-full border border-indigo-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all glass-card"
            >
              {showAll ? projects.showLessLabel : projects.showMoreLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}