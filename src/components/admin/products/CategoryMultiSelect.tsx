'use client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryMultiSelectProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function CategoryMultiSelect({
  categories,
  selected,
  onChange,
}: CategoryMultiSelectProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">分類</label>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-3">
        {categories.length === 0 && (
          <p className="text-sm text-gray-500">尚無分類</p>
        )}
        {categories.map((cat) => (
          <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selected.includes(cat.id)}
              onChange={() => toggle(cat.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{cat.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
