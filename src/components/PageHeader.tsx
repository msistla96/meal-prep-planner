import type { ReactNode } from "react";

export function PageHeader({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
      </div>
      {children ? <div className="page-actions">{children}</div> : null}
    </header>
  );
}
