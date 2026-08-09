// src/components/sections/Projects.tsx
import ProjectGrid from '@/components/sections/ProjectGrid'
import { projects } from '@/lib/data'

export default function Projects() {
  return (
    <ProjectGrid
      id="projects"
      variant="violet"
      index="02"
      config={projects}
    />
  )
}