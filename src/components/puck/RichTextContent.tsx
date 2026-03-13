interface RichTextContentProps {
  html: string;
}

export function RichTextContent({ html }: RichTextContentProps) {
  if (!html) return null;
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
