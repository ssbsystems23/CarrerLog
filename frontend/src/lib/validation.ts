/**
 * Checks if an HTML string has meaningful content.
 * TipTap outputs `<p></p>` for empty editors.
 */
export function htmlNotEmpty(html: string): boolean {
  if (!html) return false;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
}
