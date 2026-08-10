// src/components/sections/AboutIllustration.tsx
// “关于我”区块的卡通插画：扁平风人物 + 漂浮叶子/星光/漩涡线 + 玻璃徽章，
// 配色沿用全站靛蓝/紫渐变体系，与 Section 的柔光球、点阵纹理保持统一。
import { Brain, Lightbulb, Sparkles } from 'lucide-react'

export default function AboutIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square select-none" aria-hidden>
      {/* 主光晕（人物背后柔和发光的层次） */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-200/60 via-purple-200/40 to-sky-200/50 blur-2xl" />

      <svg viewBox="0 0 400 400" className="relative w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="blob" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
          <linearGradient id="dress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* 底座渐变圆 + 旋转虚线环（层次感） */}
        <circle cx="200" cy="205" r="150" fill="url(#blob)" />
        <circle
          cx="200"
          cy="205"
          r="150"
          fill="none"
          stroke="#c7d2fe"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {/* 底部波浪线 */}
        <path d="M 62 302 Q 130 272 200 302 T 338 302" fill="none" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" opacity="0.45" />

        {/* 地面阴影 */}
        <ellipse cx="200" cy="298" rx="72" ry="12" fill="#6366f1" opacity="0.12" />

        {/* 腿部 */}
        <rect x="182" y="236" width="15" height="36" rx="7" fill="#f6c9a4" />
        <rect x="203" y="236" width="15" height="36" rx="7" fill="#f6c9a4" />
        {/* 鞋子 */}
        <path d="M 174 272 h 32 a 6 6 0 0 1 6 6 v 4 a 8 8 0 0 1 -8 8 h -30 a 6 6 0 0 1 -6 -6 v -6 a 6 6 0 0 1 6 -6 z" fill="#7c3aed" />
        <path d="M 194 272 h 32 a 6 6 0 0 1 6 6 v 4 a 8 8 0 0 1 -8 8 h -30 a 6 6 0 0 1 -6 -6 v -6 a 6 6 0 0 1 6 -6 z" fill="#6366f1" />

        {/* 连衣裙（靛蓝→紫渐变） */}
        <path d="M 152 178 C 152 158 160 148 176 146 L 224 146 C 240 148 248 158 248 178 L 244 240 L 156 240 Z" fill="url(#dress)" />
        {/* 领口 */}
        <path d="M 184 146 C 190 158 210 158 216 146 Z" fill="#c7d2fe" opacity="0.85" />
        {/* 腰带 + 纽扣 */}
        <rect x="156" y="196" width="88" height="10" rx="5" fill="#ede9fe" opacity="0.85" />
        <circle cx="200" cy="201" r="5" fill="#a855f7" />

        {/* 手臂 */}
        <rect x="130" y="170" width="16" height="50" rx="8" transform="rotate(10 138 195)" fill="#f6c9a4" />
        <rect x="254" y="170" width="16" height="50" rx="8" transform="rotate(-10 262 195)" fill="#f6c9a4" />
        {/* 手 */}
        <circle cx="134" cy="216" r="9" fill="#f6c9a4" />
        <circle cx="266" cy="216" r="9" fill="#f6c9a4" />

        {/* 脖子 + 耳朵 */}
        <rect x="190" y="148" width="20" height="16" rx="5" fill="#f0be8e" />
        <circle cx="158" cy="122" r="6" fill="#f0be8e" />
        <circle cx="242" cy="122" r="6" fill="#f0be8e" />

        {/* 脸 */}
        <circle cx="200" cy="118" r="38" fill="#f6c9a4" />

        {/* 后部头发（环绕脸部的发廓，深靛蓝） */}
        <path
          d="M 200 56 C 168 56 154 78 156 104 C 157 128 165 146 180 158 C 188 163 212 163 220 158 C 235 146 243 128 244 104 C 246 78 232 56 200 56 Z"
          fill="#312e81"
        />
        {/* 刘海（波浪发际线，亮靛蓝） */}
        <path
          d="M 200 78 C 176 78 168 88 168 102 C 172 106 178 106 182 100 C 188 108 194 108 198 100 C 203 108 210 108 216 100 C 221 106 227 106 232 101 C 232 88 224 78 200 78 Z"
          fill="#4338ca"
        />

        {/* 眼睛 / 腮红 / 微笑 */}
        <circle cx="186" cy="122" r="3.6" fill="#312e81" />
        <circle cx="214" cy="122" r="3.6" fill="#312e81" />
        <ellipse cx="174" cy="132" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.55" />
        <ellipse cx="226" cy="132" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.55" />
        <path d="M 192 133 Q 200 141 208 133" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />

        {/* 头顶小脑标记（光圈） */}
        <circle cx="200" cy="36" r="13" fill="#a5b4fc" opacity="0.7" />
        <circle cx="200" cy="36" r="5" fill="#818cf8" />

        {/* 漂浮叶子（drift 动画） */}
        <g className="animate-drift">
          <path d="M 66 120 C 74 112 84 112 90 120 C 84 128 74 128 66 120 Z" fill="#2dd4bf" opacity="0.85" />
        </g>
        <g className="animate-drift" style={{ animationDelay: '1.4s' }}>
          <path d="M 318 96 C 326 88 336 88 342 96 C 336 104 326 104 318 96 Z" fill="#f472b6" opacity="0.8" />
        </g>
        <g className="animate-drift-slow" style={{ animationDelay: '0.7s' }}>
          <path d="M 96 268 C 104 260 114 260 120 268 C 114 276 104 276 96 268 Z" fill="#a78bfa" opacity="0.8" />
        </g>
        <g className="animate-drift-slow" style={{ animationDelay: '2.1s' }}>
          <path d="M 306 260 C 314 252 324 252 330 260 C 324 268 314 268 306 260 Z" fill="#38bdf8" opacity="0.8" />
        </g>

        {/* 星光（twinkle 动画） */}
        <g className="animate-twinkle">
          <path d="M 70 70 l 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill="#fbbf24" />
        </g>
        <g className="animate-twinkle" style={{ animationDelay: '0.8s' }}>
          <path d="M 320 52 l 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill="#c4b5fd" />
        </g>

        {/* 漩涡线（缓慢旋转） */}
        <path
          d="M 52 210 C 70 196 88 210 82 226 C 76 240 56 240 56 222"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <path
          d="M 344 168 C 328 156 312 168 316 182 C 320 194 340 194 340 180"
          fill="none"
          stroke="#c084fc"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '1.2s' }}
        />
      </svg>

      {/* 漂浮玻璃徽章（层次感，沿用 glass-card 风格） */}
      <div className="absolute top-4 -left-2 sm:left-0 animate-float glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600 shadow-md">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <Brain size={12} />
        </span>
        脑科学
      </div>
      <div className="absolute bottom-10 -right-2 sm:right-0 animate-float-delayed glass-card rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-purple-600 shadow-md">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Lightbulb size={12} />
        </span>
        产品思维
      </div>
      <div className="absolute top-1/2 -right-4 hidden sm:flex animate-wiggle glass-card rounded-full p-2 text-indigo-500 shadow-md">
        <Sparkles size={14} />
      </div>
    </div>
  )
}
