'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextFieldProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

export function RichTextField({ value, onChange, label }: RichTextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '請輸入內容...' }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded border border-gray-300">
      {label && (
        <div className="border-b border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('bold') ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-0.5 text-xs italic ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded px-2 py-0.5 text-xs underline ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          U
        </button>
        <span className="mx-1 border-l border-gray-300" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          H3
        </button>
        <span className="mx-1 border-l border-gray-300" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          1.
        </button>
        <span className="mx-1 border-l border-gray-300" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('輸入連結 URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`rounded px-2 py-0.5 text-xs ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[120px] px-3 py-2 text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]" />
    </div>
  );
}
