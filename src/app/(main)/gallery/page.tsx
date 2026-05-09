import { MemoryGallery, type MemoryImage } from "@/components/ui/MemoryGallery";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { GradientHero } from "@/components/ui/GradientHero";
import { getCategories, getPhotos } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [photos, categories] = await Promise.all([getPhotos(), getCategories()]);

  const images: MemoryImage[] = photos.map((p) => ({
    src: p.url,
    alt: p.alt,
    caption: p.caption,
    width: p.width,
    height: p.height,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <GradientHero variant="party" emojis={["📸", "🎞️", "🌟", "💫", "🎊", "🎈"]}>
        <div className="px-6 sm:px-10 py-10 sm:py-14 animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-700 font-semibold mb-2">
            A scrapbook of moments
          </p>
          <h1 className="heading-display text-4xl sm:text-5xl font-bold">
            <span className="text-gradient">Memory Gallery</span>
          </h1>
          <p className="text-gray-700 mt-2 max-w-xl">
            Snapshots from school days, get-togethers, and reunion moments worth remembering.
          </p>
        </div>
      </GradientHero>

      <div className="mt-8">
        {categories.length > 0 && <CategoryFilter categories={categories} />}

        {images.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-accent-50 rounded-3xl border border-amber-100">
            <div className="text-5xl mb-3 animate-float-med inline-block">🖼️</div>
            <p className="text-lg font-semibold text-gray-800 heading-display">No photos yet</p>
            <p className="text-sm text-gray-500 mt-1">Check back soon — memories are on their way!</p>
          </div>
        ) : (
          <MemoryGallery images={images} />
        )}
      </div>
    </main>
  );
}
