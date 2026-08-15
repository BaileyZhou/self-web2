// src/components/ui/NeuronBackground.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function NeuronBackground({
  rgb = '99,102,241',
  paused = false,
}: {
  rgb?: string
  /** 暂停动画（首帧前 / 页面隐藏时），降低主线程占用 */
  paused?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    let animationId = 0
    let running = false

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 2 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb}, 0.15)`
        ctx.fill()
      }
    }

    function initParticles() {
      particles = []
      const count = Math.min(60, Math.floor((width * height) / 15000))
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    function drawLines() {
      if (!ctx) return
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const alpha = 0.08 * (1 - dist / 150)
            ctx.strokeStyle = `rgba(${rgb}, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
    }

    function loop() {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      drawLines()
      animationId = requestAnimationFrame(loop)
    }

    // 是否该运行动画：未暂停 且 页面可见
    const shouldRun = () => !pausedRef.current && !document.hidden
    const sync = () => {
      if (shouldRun()) {
        if (!running) {
          running = true
          loop()
        }
      } else {
        running = false
        cancelAnimationFrame(animationId)
      }
    }

    resize()
    sync()
    // 页面切换隐藏/显示时启停动画
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('resize', resize)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('resize', resize)
    }
  }, [rgb, paused])

  return <canvas ref={canvasRef} className="w-full h-full opacity-40" />
}