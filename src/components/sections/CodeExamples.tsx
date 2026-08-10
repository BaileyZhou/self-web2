// src/components/sections/CodeExamples.tsx
import ProjectGrid from '@/components/sections/ProjectGrid'
import CodeIllustration from '@/components/sections/CodeIllustration'
import { codeExamples } from '@/lib/data'

export default function CodeExamples() {
  return (
    <ProjectGrid
      id="code-examples"
      variant="fuchsia"
      index="05"
      config={codeExamples}
      illustration={<CodeIllustration />}
      illustrationSide="right"
    />
  )
}
