// src/app/page.tsx
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Experience from '@/components/sections/Experience'
import Papers from '@/components/sections/Papers'
import CodeExamples from '@/components/sections/CodeExamples'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Papers />
      <CodeExamples />
    </>
  )
}