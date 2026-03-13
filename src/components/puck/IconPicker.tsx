'use client';

import { useState, useMemo } from 'react';
import { ICON_LIBS, renderReactIcon, type IconLibKey } from '@/lib/puck/ionicons';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [lib, setLib] = useState<IconLibKey>('io5');

  const icons = useMemo(() => {
    const entries = Object.keys(ICON_LIBS[lib]);
    if (!search) return entries.slice(0, 60);
    const q = search.toLowerCase();
    return entries.filter((name) => name.toLowerCase().includes(q)).slice(0, 60);
  }, [lib, search]);

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-gray-300">
          {value ? renderReactIcon(value, 20) : <span className="text-xs text-gray-300">?</span>}
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded bg-gray-100 px-3 py-1.5 text-xs hover:bg-gray-200"
        >
          {open ? '關閉' : '選擇圖示'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-600"
          >
            清除
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 rounded border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex gap-2">
            {(Object.keys(ICON_LIBS) as IconLibKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setLib(k)}
                className={`rounded px-2 py-0.5 text-xs ${lib === k ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {k}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋圖示..."
            className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
            {icons.map((name) => {
              const val = `${lib}:${name}`;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(val); setOpen(false); }}
                  title={name}
                  className={`flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 ${value === val ? 'bg-blue-100 ring-1 ring-blue-400' : ''}`}
                >
                  {renderReactIcon(val, 16)}
                </button>
              );
            })}
          </div>
          {icons.length === 0 && (
            <p className="py-2 text-center text-xs text-gray-400">找不到圖示</p>
          )}
        </div>
      )}
    </div>
  );
}
