'use client';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagMultiSelectProps {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function TagMultiSelect({
  tags,
  selected,
  onChange,
}: TagMultiSelectProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">標籤</label>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-3">
        {tags.length === 0 && (
          <p className="text-sm text-gray-500">尚無標籤</p>
        )}
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(tag.id)}
              onChange={() => toggle(tag.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{tag.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
