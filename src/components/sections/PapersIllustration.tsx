// src/components/sections/PapersIllustration.tsx
// “论文阅读”区块的卡通插画：与“关于我”同一人物/风格，
// 主题色为玫瑰红，漂浮元素为放大镜与论文纸。
import { FileText, Search, Sparkles } from 'lucide-react'
import IllustrationBase, { type IllustrationTheme } from '@/components/sections/IllustrationBase'

const theme: IllustrationTheme = {
  glow: ['rgba(253,164,175,0.45)', 'rgba(244,63,94,0.25)', 'rgba(249,168,212,0.4)'],
  blob: ['#ffe4e6', '#fff1f2'],
  ring: '#fecdd3',
  wave: '#fda4af',
  shadow: '#f43f5e',
  dress: ['#f43f5e', '#ec4899'],
  hair: ['#881337', '#be123c'],
  leaf1: '#34d399',
  leaf2: '#818cf8',
  star: '#fcd34d',
  swirl1: '#fda4af',
  swirl2: '#f9a8d4',
}

export default function PapersIllustration() {
  return (
    <IllustrationBase
      idPrefix="paper"
      theme={theme}
      showCharacter={false}
      chips={
        <>
          <div className="absolute top-4 -left-2 sm:left-0 animate-float glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white">
              <FileText size={12} />
            </span>
            论文精读
          </div>
          <div className="absolute bottom-10 -right-2 sm:right-0 animate-float-delayed glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-pink-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white">
              <Search size={12} />
            </span>
            前沿追踪
          </div>
          <div className="absolute top-1/2 -right-4 hidden sm:flex animate-wiggle glass-card rounded-full p-2 text-rose-500 shadow-md">
            <Sparkles size={14} />
          </div>
        </>
      }
    >
      {/* 放大镜（左上，悬于论文上方） */}
      <g transform="translate(148,108)">
        <g className="animate-float" style={{ animationDelay: '0.4s' }}>
          <circle r="24" fill="#fecdd3" opacity="0.4" />
          <circle r="24" fill="none" stroke="#f43f5e" strokeWidth="6" />
          <circle r="11" fill="#ffffff" opacity="0.55" />
          <path d="M 20 20 L 40 40" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
        </g>
      </g>

      {/* 中央：论文纸（大主体，带标题/正文/勾选） */}
      <g transform="translate(206,216) rotate(-3)">
        <rect x="-52" y="-62" width="104" height="124" rx="8" fill="#ffffff" stroke="#fda4af" strokeWidth="3" />
        {/* 折角 */}
        <path d="M 52 -62 L 52 -30 L 20 -30 Z" fill="#ffe4e6" />
        {/* 标题线 */}
        <path d="M -30 -42 h 36 M -30 -33 h 24" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        {/* 正文线 */}
        <path d="M -30 -14 h 58 M -30 -4 h 58 M -30 6 h 48 M -30 16 h 58 M -30 26 h 40" stroke="#fecdd3" strokeWidth="4" strokeLinecap="round" />
        {/* 勾选 */}
        <path d="M -22 44 l 10 10 l 22 -24" fill="none" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 钢笔（右下） */}
      <g transform="translate(304,268) rotate(32)">
        <rect x="-6" y="-40" width="12" height="48" rx="6" fill="#fb7185" />
        <path d="M -6 8 L 0 20 L 6 8 Z" fill="#f43f5e" />
        <rect x="-6" y="-46" width="12" height="8" rx="3" fill="#e2e8f0" />
      </g>
    </IllustrationBase>
  )
}
