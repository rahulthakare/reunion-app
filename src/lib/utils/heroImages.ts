import fs from "fs";
import path from "path";
import { imageSize } from "image-size";
import type { MemoryImage } from "@/components/ui/MemoryGallery";

/**
 * Auto-discovers memory gallery images from the public/images folder.
 *
 * Picks up any file matching memory_*.{jpg,jpeg,png,webp} and reads each
 * file's actual width/height so the gallery can preserve aspect ratios.
 *
 * Recommended naming for explicit ordering:
 *   memory_01.jpg
 *   memory_02.png
 *   memory_03_school_building.jpg
 *
 * Captions are derived from the filename:
 *   memory_03_school_building.jpg -> "School Building"
 */
export function discoverMemoryImages(): MemoryImage[] {
  const imagesDir = path.join(process.cwd(), "public", "images");

  if (!fs.existsSync(imagesDir)) return [];

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /^memory_.*\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  return files.map((file) => {
    const filePath = path.join(imagesDir, file);
    let width = 1200;
    let height = 800;

    try {
      const buffer = fs.readFileSync(filePath);
      const dim = imageSize(buffer);
      if (dim.width && dim.height) {
        width = dim.width;
        height = dim.height;
      }
    } catch (err) {
      console.warn(`[heroImages] Could not read dimensions for ${file}:`, err);
    }

    // Strip prefix + ordering number + extension, then humanize
    // memory_03_school_building.png -> "school_building" -> "School Building"
    const base = file.replace(/^memory_\d+_?/i, "").replace(/\.(jpe?g|png|webp)$/i, "");
    const caption = base
      .replace(/[-_]/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      src: `/images/${file}`,
      alt: caption || "Reunion memory",
      caption: caption || undefined,
      width,
      height,
    };
  });
}
