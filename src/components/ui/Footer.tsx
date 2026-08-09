// src/components/ui/Footer.tsx
import Link from 'next/link'
import { Github, Linkedin, Mail, Twitter, Globe, type LucideIcon } from 'lucide-react'
import { footer } from '@/lib/data'

// 图标映射：把 data.ts 里 socials 的 icon 字符串对应到 lucide 图标组件
const iconMap: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  twitter: Twitter,
  globe: Globe,
}

export default function Footer() {
  // {year} 自动替换为当前年份，方便你在 data.ts 里写固定文案
  const copyright = footer.copyright.replace('{year}', String(new Date().getFullYear()))

  return (
    <footer className="relative z-10 border-t border-white/40 bg-white/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{copyright}</p>
          {footer.tagline && <p className="text-sm text-slate-500">{footer.tagline}</p>}
          <div className="flex items-center gap-4">
            {footer.socials.map((social) => {
              const Icon = iconMap[social.icon] ?? Globe
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  aria-label={social.label}
                >
                  <Icon size={20} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}