// src/components/sections/IllustrationBase.tsx
// 各区块卡通插画的共享基座：与“关于我”插画同一风格 ——
// 扁平人物（相同五官/发型/身形）+ 渐变底座圆 + 旋转虚线环 +
// 漂浮叶子/星光/漩涡线 + 头顶光圈；主题色与漂浮元素由各主题组件传入。
import { ReactNode } from 'react'

export interface IllustrationTheme {
  /** 人物背后光晕渐变的三个颜色（rgba） */
  glow: [string, string, string]
  /** 底座渐变圆的两个颜色（hex） */
  blob: [string, string]
  ring: string
  wave: string
  shadow: string
  /** 连衣裙渐变（hex） */
  dress: [string, string]
  /** [后部头发, 刘海]（hex） */
  hair: [string, string]
  leaf1: string
  leaf2: string
  star: string
  swirl1: string
  swirl2: string
}

interface IllustrationBaseProps {
  /** 渐变 id 前缀（每个主题组件唯一，避免多张插画 id 冲突） */
  idPrefix: string
  theme: IllustrationTheme
  /** 是否绘制中央扁平人物（“关于我”为 true；其余用主题主体物替代） */
  showCharacter?: boolean
  /** SVG 内的主题元素（人物道具或主题主体物），局部坐标绘制 */
  children?: ReactNode
  /** 容器内的漂浮玻璃徽章（HTML） */
  chips?: ReactNode
}

export default function IllustrationBase({
  idPrefix,
  theme,
  showCharacter = true,
  children,
  chips,
}: IllustrationBaseProps) {
  const [glowA, glowB, glowC] = theme.glow
  const [blobA, blobB] = theme.blob
  const [dressA, dressB] = theme.dress
  const [hairDark, hairLight] = theme.hair

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square select-none" aria-hidden>
      {/* 主光晕（人物背后柔和发光的层次） */}
      <div
        className="absolute inset-6 rounded-full blur-2xl"
        style={{ background: `linear-gradient(135deg, ${glowA}, ${glowB}, ${glowC})` }}
      />

      <svg viewBox="0 0 400 400" className="relative w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id={`${idPrefix}-blob`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={blobA} />
            <stop offset="100%" stopColor={blobB} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-dress`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dressA} />
            <stop offset="100%" stopColor={dressB} />
          </linearGradient>
        </defs>

        {/* 底座渐变圆 + 旋转虚线环（层次感） */}
        <circle cx="200" cy="205" r="150" fill={`url(#${idPrefix}-blob)`} />
        <circle
          cx="200"
          cy="205"
          r="150"
          fill="none"
          stroke={theme.ring}
          strokeWidth="1.5"
          strokeDasharray="4 8"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {/* 底部波浪线 + 地面阴影 */}
        <path d="M 62 302 Q 130 272 200 302 T 338 302" fill="none" stroke={theme.wave} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
        <ellipse cx="200" cy="298" rx="72" ry="12" fill={theme.shadow} opacity="0.12" />

        {/* ===== 扁平人物（与“关于我”同款五官/发型/身形；可按需关闭） ===== */}
        {showCharacter && (
          <>
            {/* 腿部 */}
            <rect x="182" y="236" width="15" height="36" rx="7" fill="#f6c9a4" />
            <rect x="203" y="236" width="15" height="36" rx="7" fill="#f6c9a4" />
            {/* 鞋子 */}
            <path d="M 174 272 h 32 a 6 6 0 0 1 6 6 v 4 a 8 8 0 0 1 -8 8 h -30 a 6 6 0 0 1 -6 -6 v -6 a 6 6 0 0 1 6 -6 z" fill={dressB} />
            <path d="M 194 272 h 32 a 6 6 0 0 1 6 6 v 4 a 8 8 0 0 1 -8 8 h -30 a 6 6 0 0 1 -6 -6 v -6 a 6 6 0 0 1 6 -6 z" fill={dressA} />
            {/* 连衣裙（主题渐变） */}
            <path d="M 152 178 C 152 158 160 148 176 146 L 224 146 C 240 148 248 158 248 178 L 244 240 L 156 240 Z" fill={`url(#${idPrefix}-dress)`} />
            {/* 领口 + 腰带 + 纽扣 */}
            <path d="M 184 146 C 190 158 210 158 216 146 Z" fill={theme.ring} opacity="0.85" />
            <rect x="156" y="196" width="88" height="10" rx="5" fill="#ede9fe" opacity="0.85" />
            <circle cx="200" cy="201" r="5" fill={dressB} />
            {/* 手臂 + 手 */}
            <rect x="130" y="170" width="16" height="50" rx="8" transform="rotate(10 138 195)" fill="#f6c9a4" />
            <rect x="254" y="170" width="16" height="50" rx="8" transform="rotate(-10 262 195)" fill="#f6c9a4" />
            <circle cx="134" cy="216" r="9" fill="#f6c9a4" />
            <circle cx="266" cy="216" r="9" fill="#f6c9a4" />
            {/* 脖子 + 耳朵 */}
            <rect x="190" y="148" width="20" height="16" rx="5" fill="#f0be8e" />
            <circle cx="158" cy="122" r="6" fill="#f0be8e" />
            <circle cx="242" cy="122" r="6" fill="#f0be8e" />
            {/* 脸 */}
            <circle cx="200" cy="118" r="38" fill="#f6c9a4" />
            {/* 后部头发 + 刘海（主题色） */}
            <path
              d="M 200 56 C 168 56 154 78 156 104 C 157 128 165 146 180 158 C 188 163 212 163 220 158 C 235 146 243 128 244 104 C 246 78 232 56 200 56 Z"
              fill={hairDark}
            />
            <path
              d="M 200 78 C 176 78 168 88 168 102 C 172 106 178 106 182 100 C 188 108 194 108 198 100 C 203 108 210 108 216 100 C 221 106 227 106 232 101 C 232 88 224 78 200 78 Z"
              fill={hairLight}
            />
            {/* 眼睛 / 腮红 / 微笑 */}
            <circle cx="186" cy="122" r="3.6" fill="#312e81" />
            <circle cx="214" cy="122" r="3.6" fill="#312e81" />
            <ellipse cx="174" cy="132" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.55" />
            <ellipse cx="226" cy="132" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.55" />
            <path d="M 192 133 Q 200 141 208 133" fill="none" stroke="#312e81" strokeWidth="2.4" strokeLinecap="round" />

            {/* 头顶光圈 */}
            <circle cx="200" cy="36" r="13" fill={theme.ring} opacity="0.7" />
            <circle cx="200" cy="36" r="5" fill={theme.shadow} />
          </>
        )}

        {/* 漂浮叶子 / 星光 / 漩涡线（全站统一语言） */}
        <g className="animate-drift">
          <path d="M 66 120 C 74 112 84 112 90 120 C 84 128 74 128 66 120 Z" fill={theme.leaf1} opacity="0.85" />
        </g>
        <g className="animate-drift" style={{ animationDelay: '1.4s' }}>
          <path d="M 318 96 C 326 88 336 88 342 96 C 336 104 326 104 318 96 Z" fill={theme.leaf2} opacity="0.8" />
        </g>
        <g className="animate-twinkle">
          <path d="M 70 70 l 4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill={theme.star} />
        </g>
        <path
          d="M 52 210 C 70 196 88 210 82 226 C 76 240 56 240 56 222"
          fill="none"
          stroke={theme.swirl1}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <path
          d="M 344 168 C 328 156 312 168 316 182 C 320 194 340 194 340 180"
          fill="none"
          stroke={theme.swirl2}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          className="animate-spin-slower"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: '1.2s' }}
        />

        {/* 主题漂浮元素 */}
        {children}
      </svg>

      {chips}
    </div>
  )
}
