// src/components/sections/CodeIllustration.tsx
// “代码案例”区块的卡通插画：与“关于我”同一人物/风格，
// 主题色为洋红（fuchsia），漂浮元素为笔记本电脑与代码尖括号。
import { Code2, Github, Sparkles } from 'lucide-react'
import IllustrationBase, { type IllustrationTheme } from '@/components/sections/IllustrationBase'

const theme: IllustrationTheme = {
  glow: ['rgba(232,121,249,0.45)', 'rgba(139,92,246,0.28)', 'rgba(251,207,232,0.45)'],
  blob: ['#fae8ff', '#f5f3ff'],
  ring: '#f5d0fe',
  wave: '#e879f9',
  shadow: '#d946ef',
  dress: ['#d946ef', '#8b5cf6'],
  hair: ['#701a75', '#a21caf'],
  leaf1: '#2dd4bf',
  leaf2: '#a78bfa',
  star: '#fbbf24',
  swirl1: '#e879f9',
  swirl2: '#c4b5fd',
}

export default function CodeIllustration() {
  return (
    <IllustrationBase
      idPrefix="code"
      theme={theme}
      showCharacter={false}
      chips={
        <>
          <div className="absolute top-4 -left-2 sm:left-0 animate-float glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-fuchsia-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
              <Code2 size={12} />
            </span>
            代码实践
          </div>
          <div className="absolute bottom-10 -right-2 sm:right-0 animate-float-delayed glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-purple-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Github size={12} />
            </span>
            开源精神
          </div>
          <div className="absolute top-1/2 -right-4 hidden sm:flex animate-wiggle glass-card rounded-full p-2 text-fuchsia-500 shadow-md">
            <Sparkles size={14} />
          </div>
        </>
      }
    >
      {/* 代码尖括号 </>（左上闪烁） */}
      <g transform="translate(120,112)">
        <g className="animate-twinkle" style={{ animationDelay: '0.7s' }}>
          <path d="M -16 -6 l -12 16 l 12 16 M 16 -6 l 12 16 l -12 16" fill="none" stroke="#e879f9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -3 -22 l 6 52" stroke="#e879f9" strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>

      {/* 中央：笔记本电脑（大主体，屏幕带代码） */}
      <g transform="translate(200,214)">
        <g className="animate-float" style={{ animationDelay: '0.3s' }}>
          {/* 屏幕机身 */}
          <rect x="-60" y="-56" width="120" height="76" rx="8" fill="#c026d3" />
          {/* 屏幕 */}
          <rect x="-52" y="-48" width="104" height="58" rx="4" fill="#2e1065" />
          {/* 代码行 */}
          <path d="M -40 -34 h 22 M -40 -24 h 40 M -40 -14 h 30" stroke="#e879f9" strokeWidth="5" strokeLinecap="round" />
          <path d="M -26 -4 h 16 M -26 4 h 26" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
          {/* 屏幕高光 */}
          <path d="M -40 -44 h 22" stroke="#f5d0fe" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* 底座 */}
          <path d="M -64 26 h 128 l -16 -10 h -96 Z" fill="#86198f" />
        </g>
      </g>

      {/* 终端窗口（右下） */}
      <g transform="translate(290,288)">
        <rect x="-42" y="-26" width="84" height="52" rx="6" fill="#4a044e" stroke="#e879f9" strokeWidth="3" />
        <circle cx="-30" cy="-15" r="3.5" fill="#f43f5e" />
        <circle cx="-20" cy="-15" r="3.5" fill="#fbbf24" />
        <circle cx="-10" cy="-15" r="3.5" fill="#34d399" />
        <path d="M -32 -2 l 8 6 l -8 6" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -14 8 h 26" stroke="#f0abfc" strokeWidth="3" strokeLinecap="round" />
      </g>
    </IllustrationBase>
  )
}
