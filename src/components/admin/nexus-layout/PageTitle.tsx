import { type ReactNode } from 'react';

export function PageTitle({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-lg font-medium">{title}</p>
      {actions}
    </div>
  );
}
