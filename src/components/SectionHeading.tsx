import type { ReactNode } from 'react';

interface SectionHeadingProps {
  id: string;
  title: string;
  aside?: ReactNode;
}

export function SectionHeading({ id, title, aside }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
      <h2 id={id} className="flex items-center gap-3 font-mono text-sm uppercase tracking-[0.25em] text-ink-bright">
        <span aria-hidden="true" className="size-2 bg-lens" />
        {title}
      </h2>
      {aside}
    </div>
  );
}
