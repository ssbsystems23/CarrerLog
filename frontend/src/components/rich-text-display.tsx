interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/** Detect if content is plain text (no HTML tags). */
function isPlainText(str: string): boolean {
  return !/<[a-z][\s\S]*>/i.test(str);
}

/**
 * Renders stored HTML content. Backward-compatible: detects plain text
 * (no HTML tags) and converts newlines to `<br>`.
 */
export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  if (!content) return null;

  const html = isPlainText(content)
    ? content.replace(/\n/g, "<br>")
    : content;

  return (
    <div
      className={`rich-text-display text-sm text-muted-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
