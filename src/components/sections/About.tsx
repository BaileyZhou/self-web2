// src/components/sections/About.tsx
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { about } from '@/lib/data'

export default function About() {
  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title={about.title}
          subtitle={about.subtitle}
          badge={about.badge}
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
    </section>
  )
}