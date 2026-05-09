export type ArticleStatus = "draft" | "pending" | "published" | "rejected";
export type ArticleContentType = "text" | "pdf";

export interface Article {
  id: string;
  title: string;
  body: string;                       // Markdown body for text articles
  excerpt?: string;
  coverImageUrl?: string;
  coverImageStoragePath?: string;
  contentType: ArticleContentType;    // "text" (default) or "pdf"
  pdfUrl?: string;                    // download URL when contentType === "pdf"
  pdfStoragePath?: string;            // Storage path for cleanup
  pdfFilename?: string;               // original filename for download UI
  pdfSizeBytes?: number;              // for display
  authorId: string;                   // uploader UID
  authorName: string;                 // uploader display name
  authorPhotoURL?: string | null;
  displayAuthorName?: string;         // optional override (e.g. "Mrs. Joshi")
  section?: string;                   // optional grouping label
  status: ArticleStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  publishedAt?: string;
  updatedAt: string;
  tags?: string[];
}

export const SECTION_SUGGESTIONS = [
  "Editorial",
  "Memoirs",
  "Poems",
  "Class News",
  "Tributes",
  "Interviews",
  "Throwback",
] as const;

export function deriveExcerpt(body: string, maxLen = 220): string {
  const stripped = body
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/[#>*_~`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen - 1).trim() + "…";
}
