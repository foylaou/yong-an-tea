'use client';

interface ThemeSwatchCardProps {
  name: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function ThemeSwatchCard({ name, label, selected, onSelect }: ThemeSwatchCardProps) {
  return (
    <button
      type="button"
      data-theme={name}
      onClick={onSelect}
      className={`rounded-box cursor-pointer border-2 text-left transition-all hover:scale-105 ${selected ? 'border-primary ring-primary/30 ring-2' : 'border-base-300'}`}
    >
      <div className="bg-base-100 rounded-box p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="bg-primary h-2.5 w-2.5 rounded-full" />
          <div className="bg-secondary h-2.5 w-2.5 rounded-full" />
          <div className="bg-accent h-2.5 w-2.5 rounded-full" />
          <div className="bg-neutral h-2.5 w-2.5 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="bg-base-200 h-1.5 w-full rounded" />
          <div className="bg-base-200 h-1.5 w-3/4 rounded" />
          <div className="bg-base-300 h-1.5 w-1/2 rounded" />
        </div>
        <div className="mt-2 flex gap-1">
          <div className="btn btn-primary btn-xs px-1.5">P</div>
          <div className="btn btn-secondary btn-xs px-1.5">S</div>
        </div>
      </div>
      <div className="bg-base-200 rounded-b-box flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-medium">{label}</span>
        {selected && <span className="iconify lucide--check text-primary size-3.5" />}
      </div>
    </button>
  );
}
