// src/components/sections/ProjectsIllustration.tsx
// “项目与经历”区块的卡通插画：与“关于我”同一人物/风格，
// 主题色为紫罗兰，漂浮元素为火箭、项目文件夹与齿轮。
import { FolderKanban, Rocket, Sparkles } from 'lucide-react'
import IllustrationBase, { type IllustrationTheme } from '@/components/sections/IllustrationBase'

const theme: IllustrationTheme = {
  glow: ['rgba(167,139,250,0.45)', 'rgba(217,70,239,0.28)', 'rgba(129,140,248,0.35)'],
  blob: ['#ede9fe', '#fdf4ff'],
  ring: '#ddd6fe',
  wave: '#c4b5fd',
  shadow: '#8b5cf6',
  dress: ['#8b5cf6', '#d946ef'],
  hair: ['#4c1d95', '#6d28d9'],
  leaf1: '#2dd4bf',
  leaf2: '#f472b6',
  star: '#fbbf24',
  swirl1: '#a78bfa',
  swirl2: '#c084fc',
}

export default function ProjectsIllustration() {
  return (
    <IllustrationBase
      idPrefix="proj"
      theme={theme}
      showCharacter={false}
      chips={
        <>
          <div className="absolute top-4 -left-2 sm:left-0 animate-float glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-violet-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <FolderKanban size={12} />
            </span>
            项目管理
          </div>
          <div className="absolute bottom-10 -right-2 sm:right-0 animate-float-delayed glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-fuchsia-600 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
              <Rocket size={12} />
            </span>
            产品交付
          </div>
          <div className="absolute top-1/2 -right-4 hidden sm:flex animate-wiggle glass-card rounded-full p-2 text-violet-500 shadow-md">
            <Sparkles size={14} />
          </div>
        </>
      }
    >
      {/* 中央：火箭（大主体，缓缓漂浮） */}
      <g transform="translate(200,214) rotate(6)">
        <g className="animate-float" style={{ animationDelay: '0.3s' }}>
          {/* 尾焰 */}
          <path d="M -16 40 C -8 60 8 60 16 40 Z" fill="#fb923c" />
          <path d="M -9 40 C -4 52 4 52 9 40 Z" fill="#fde047" />
          {/* 机翼 */}
          <path d="M -20 6 L -40 24 L -20 30 Z" fill="#7c3aed" />
          <path d="M 20 6 L 40 24 L 20 30 Z" fill="#7c3aed" />
          {/* 机身 */}
          <path d="M -20 6 C -20 -36 -6 -58 0 -66 C 6 -58 20 -36 20 6 L 20 38 L -20 38 Z" fill="#a855f7" />
          {/* 鼻锥 */}
          <path d="M -10 -42 L 0 -70 L 10 -42 Z" fill="#8b5cf6" />
          {/* 舷窗 */}
          <circle cx="0" cy="-10" r="8" fill="#f3e8ff" stroke="#6d28d9" strokeWidth="3" />
          {/* 舱体线 */}
          <path d="M -20 18 L 20 18" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* 项目文件夹卡片（左下漂浮） */}
      <g transform="translate(66,282) rotate(-6)">
        <g className="animate-float-delayed">
          <rect x="-24" y="-14" width="48" height="30" rx="5" fill="#ddd6fe" />
          <rect x="-24" y="-14" width="22" height="9" rx="4" fill="#c4b5fd" />
          <path d="M -13 3 l 7 7 l 13 -13" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* 齿轮（右下旋转） */}
      <g transform="translate(326,258)">
        <g className="animate-spin-slow" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="-2.5" y="-19" width="5" height="11" rx="2" fill="#a78bfa" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="11" fill="#a78bfa" />
          <circle r="4" fill="#f5f3ff" />
        </g>
      </g>
    </IllustrationBase>
  )
}
