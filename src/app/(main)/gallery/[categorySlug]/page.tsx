import { notFound } from "next/navigation";
import { MemoryGallery, type MemoryImage } from "@/components/ui/MemoryGallery";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { getCategories, getPhotos } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

export default async function CategoryGalleryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const photos = await getPhotos(category.id);
  const images: MemoryImage[] = photos.map((p) => ({
    src: p.url,
    alt: p.alt,
    caption: p.caption,
    width: p.width,
    height: p.height,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {category.icon ? `${category.icon} ` : ""}{category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </header>

      <CategoryFilter categories={categories} activeSlug={category.slug} />

      {images.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg font-medium text-gray-700">
            No photos in {category.name} yet
          </p>
        </div>
      ) : (
        <MemoryGallery images={images} />
      )}
    </main>
  );
}
