"use client";

interface PdfPreviewProps {
  url: string;
  title?: string;
  filename?: string;
  sizeBytes?: number;
  /** Tailwind height class for the iframe; defaults to a tall reading viewport */
  heightClass?: string;
}

function formatBytes(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PdfPreview({
  url,
  title,
  filename,
  sizeBytes,
  heightClass = "h-[80vh]",
}: PdfPreviewProps) {
  const sizeLabel = formatBytes(sizeBytes);
  const downloadName = filename?.trim() || (title ? `${title}.pdf` : "article.pdf");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600 truncate">
          {filename ? <span className="font-mono">{filename}</span> : "PDF document"}
          {sizeLabel && <span className="text-gray-400"> · {sizeLabel}</span>}
        </div>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            ↗ Open in new tab
          </a>
          <a href={url} download={downloadName} className="btn-primary text-sm">
            ⬇ Download
          </a>
        </div>
      </div>
      <iframe
        src={`${url}#toolbar=1&navpanes=0`}
        title={title || "PDF preview"}
        className={`w-full ${heightClass} rounded-lg border border-gray-200 bg-white`}
      />
      <p className="text-xs text-gray-500">
        If the preview doesn&apos;t load, click <strong>Open in new tab</strong> or <strong>Download</strong>.
      </p>
    </div>
  );
}
