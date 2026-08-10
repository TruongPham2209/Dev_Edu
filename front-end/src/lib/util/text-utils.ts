/**
 * Utility functions for text processing and HTML stripping.
 */

/**
 * Strips HTML tags and unescapes common HTML entities to produce plain text for preview excerpts.
 */
export function stripHtmlTags(html?: string | null): string {
  if (!html) return "";
  
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
