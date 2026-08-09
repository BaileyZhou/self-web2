// src/components/ui/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`glass-card rounded-xl p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}