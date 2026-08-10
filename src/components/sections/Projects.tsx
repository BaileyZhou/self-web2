// src/components/sections/Projects.tsx
import Timeline from '@/components/sections/Timeline'
import ProjectsIllustration from '@/components/sections/ProjectsIllustration'
import { projects } from '@/lib/data'

export default function Projects() {
  return (
    <Timeline
      id="projects"
      variant="violet"
      index="02"
      config={projects}
      illustration={<ProjectsIllustration />}
      illustrationSide="left"
    />
  )
}