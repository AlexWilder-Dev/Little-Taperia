import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: 'start' | 'center';
}

export function SectionHeading({ id, eyebrow, title, children, align = 'start' }: SectionHeadingProps) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-heading__title display">
        {title}
      </h2>
      {children && <div className="section-heading__intro lede">{children}</div>}
    </Reveal>
  );
}
