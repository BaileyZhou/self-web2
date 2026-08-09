// src/components/sections/About.tsx
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { Download } from 'lucide-react'
import { about } from '@/lib/data'

export default function About() {
  return (
    <Section id="about" variant="indigo" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={about.title}
          subtitle={about.subtitle}
          badge={about.badge}
          index="01"
        />

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">{about.storyHeading}</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{about.story}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50/80 rounded-full border border-indigo-200/50"
                >
                  {skill}
                </span>
              ))}
            </div>
            {/* 简历下载按钮：与站点风格一致的渐变圆角按钮，点击自动下载 PDF */}
            {about.resume?.file && (
              <div className="mt-6">
                <a
                  href={about.resume.file}
                  download
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Download size={16} />
                  {about.resume.label}
                </a>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">{about.valuesHeading}</h3>
            <ul className="space-y-3 text-slate-600">
              {about.values.map((value) => (
                <li key={value} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">✦</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Section>
  )
}