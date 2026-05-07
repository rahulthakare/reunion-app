"use client";

import Image from "next/image";
import { useState } from "react";

export interface MemoryImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

interface MemoryGalleryProps {
  images: MemoryImage[];
}

/**
 * MemoryGallery — responsive masonry/grid display for reunion images.
 *
 * - Each image keeps its natural aspect ratio (no awkward cropping)
 * - Click any image to open lightbox view
 * - Mobile: 1 column · Tablet: 2 columns · Desktop: 3 columns
 * - Uses CSS columns for true masonry flow
 */
export function MemoryGallery({ images }: MemoryGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (images.length === 0) return null;

  function close() {
    setLightboxIdx(null);
  }
  function prev() {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }
  function next() {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
  }

  return (
    <>
      {/* CSS columns give true masonry; gap-4 between, no awkward cropping */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="block w-full mb-4 break-inside-avoid group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 bg-gray-100 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
            aria-label={`Open ${img.caption || img.alt} in full view`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="block w-full h-auto group-hover:scale-105 transition-transform duration-500"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
          }}
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
          >
            ✕
          </button>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
            >
              ›
            </button>
          )}

          {/* The image itself — stops click bubble */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIdx].src}
              alt={images[lightboxIdx].alt}
              width={images[lightboxIdx].width}
              height={images[lightboxIdx].height}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
              priority
            />
          </div>

          {/* Caption + counter */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            {images[lightboxIdx].caption && (
              <p className="text-white text-sm sm:text-base font-medium mb-1">
                {images[lightboxIdx].caption}
              </p>
            )}
            <p className="text-white/60 text-xs">
              {lightboxIdx + 1} of {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
