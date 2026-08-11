import { Inbox } from 'lucide-react';
import { Button } from './Button';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center" role="status">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-wave-50 text-wave-700 dark:bg-wave-950/50 dark:text-wave-300">
        {icon || <Inbox size={22} aria-hidden />}
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
