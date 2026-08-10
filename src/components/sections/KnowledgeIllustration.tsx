// src/components/sections/KnowledgeIllustration.tsx
// “知识库”区块的卡通插画：与“关于我”同一人物/风格，
// 主题色为天空蓝，漂浮元素为灯泡与书本堆。
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react'
import IllustrationBase, { type IllustrationTheme } from '@/components/sections/IllustrationBase'

const theme: IllustrationTheme = {
  glow: ['rgba(125,211,252,0.45)', 'rgba(99,102,241,0.28)', 'rgba(165,243,252,0.4)'],
  blob: ['#e0f2fe', '#eef2ff'],
  ring: '#bae6fd',
  wave: '#7dd3fc',
  shadow: '#0ea5e9',
  dress: ['#0ea5e9', '#6366f1'],
  hair: ['#0c4a6e', '#0369a1'],
  leaf1: '#34d399',
  leaf2: '#a78bfa',
  star: '#fcd34d',
  swirl1: '#7dd3fc',
  swirl2: '#93c5fd',
}

export default function KnowledgeIllustration() {
  return (
    <IllustrationBase
      idPrefix="know"
      theme={theme}
      showCharacter={false}
      chips={
        <>
          <div className="absolute top-4 -left-2 sm:left-0 animate-float glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-sky-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
              <BookOpen size={12} />
            </span>
            知识沉淀
          </div>
          <div className="absolute bottom-10 -right-2 sm:right-0 animate-float-delayed glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <GraduationCap size={12} />
            </span>
            持续学习
          </div>
          <div className="absolute top-1/2 -right-4 hidden sm:flex animate-wiggle glass-card rounded-full p-2 text-sky-500 shadow-md">
            <Sparkles size={14} />
          </div>
        </>
      }
    >
      {/* 从书中升起的灯泡（上方漂浮） */}
      <g transform="translate(200,110)">
        <g className="animate-float" style={{ animationDelay: '0.5s' }}>
          <path d="M 0 -32 v -10 M 17 -17 l 8 -8 M -17 -17 l -8 -8" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle r="18" fill="#fbbf24" />
          <path d="M -10 13 h 20 v 6 h -20 Z" fill="#d97706" />
          <path d="M -6 8 l 1.5 4 h 9 l 1.5 -4" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* 中央：翻开的图书（大主体） */}
      <g transform="translate(200,238)">
        {/* 左页 */}
        <path d="M -2 -14 C -24 -32 -64 -28 -78 -6 L -78 34 C -62 24 -30 24 -2 30 Z" fill="#ffffff" stroke="#7dd3fc" strokeWidth="3" strokeLinejoin="round" />
        {/* 右页 */}
        <path d="M 2 -14 C 24 -32 64 -28 78 -6 L 78 34 C 62 24 30 24 2 30 Z" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="3" strokeLinejoin="round" />
        {/* 书脊 */}
        <line x1="0" y1="-20" x2="0" y2="30" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
        {/* 左页文字 */}
        <path d="M -52 0 h 22 M -56 10 h 30 M -48 20 h 20" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        {/* 右页文字 */}
        <path d="M 18 0 h 32 M 12 10 h 38 M 14 20 h 26" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        {/* 飘起的书页 */}
        <path d="M -46 -26 l 14 -10 M 40 -22 l -10 -12" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>

      {/* 右下角小书堆 */}
      <g transform="translate(318,280) rotate(4)">
        <rect x="-28" y="-22" width="56" height="11" rx="3" fill="#7dd3fc" />
        <rect x="-32" y="-11" width="64" height="12" rx="3" fill="#38bdf8" />
        <rect x="-26" y="1" width="52" height="13" rx="3" fill="#0284c7" />
      </g>
    </IllustrationBase>
  )
}
