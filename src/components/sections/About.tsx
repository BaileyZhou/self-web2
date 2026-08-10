// src/components/sections/About.tsx
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import AboutIllustration from '@/components/sections/AboutIllustration'
import { Download, Sparkles } from 'lucide-react'
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

        <div className="grid md:grid-cols-2 gap-6 mt-8 items-center">
          <Card className="h-full">
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

          {/* 卡通插画：与文字形成左右对称，增加视觉层次 */}
          <AboutIllustration />
        </div>

        {/* 核心主张：横排小卡片（比原来更轻量，突出层次感） */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((value) => (
            <div
              key={value}
              className="glass-card rounded-xl p-4 flex items-start gap-3 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200/70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
                <Sparkles size={14} />
              </span>
              <p className="text-sm text-slate-600 leading-snug">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}