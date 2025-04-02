import type { Project } from "@/payload-types";
import { SimpleIcon } from "@/components/image/simple-icon";

export function ProjectTechnologies({ project }: { project: Project }) {
  return (project.technologies ?? []).map((technology, idx) =>
    typeof technology === "number" || !technology.hasLogo ? null : (
      <SimpleIcon
        colored={!technology.isSimpleIcon}
        tooltip
        key={`project-technology-${idx}`}
        name={technology.name}
        alt={technology.name}
      />
    ),
  );
}
