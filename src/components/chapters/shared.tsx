import type { ReactNode } from "react";

export type Project = {
  index: string;
  title: string;
  discipline: string;
  year: string;
  note: string;
};

export type ChapterProps = {
  project: Project;
  /** Experience writes the live chapter progress onto this element as --p */
  chapterRef: (el: HTMLDivElement | null) => void;
};

export function ProjectPlaque({ project }: { project: Project }) {
  return (
    <div className="w-full max-w-[52rem] px-8 md:px-0">
      <div className="flex items-baseline gap-6 text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground md:text-xs">
        <span>{project.index}</span>
        <span>{project.discipline}</span>
        <span>{project.year}</span>
      </div>
      <h2 className="mt-6 text-[16vw] font-bold leading-[0.84] tracking-tight md:text-[8vw]">
        {project.title}
      </h2>
      <div className="mt-8 h-px w-full bg-foreground/25" />
      <p className="mt-7 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-lg">
        {project.note}
      </p>
    </div>
  );
}

export function Stagecraft({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {children}
    </div>
  );
}
