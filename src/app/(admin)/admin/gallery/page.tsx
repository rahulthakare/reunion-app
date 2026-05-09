import Link from "next/link";
import { PhotoUploadForm } from "@/components/features/PhotoUploadForm";
import { AdminPhotoList } from "@/components/features/AdminPhotoList";
import { getCategories, getPhotos } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const [photos, categories] = await Promise.all([getPhotos(), getCategories()]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-500 mt-1">
            Upload and manage memory photos for the reunion.
          </p>
        </div>
        <Link href="/admin/gallery/categories" className="btn-secondary text-sm">
          Manage Categories
        </Link>
      </div>

      {categories.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You haven&apos;t set up any categories yet.{" "}
          <Link href="/admin/gallery/categories" className="font-semibold underline">
            Add a few now
          </Link>{" "}
          (or upload as Uncategorized).
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Photos</h2>
        <PhotoUploadForm categories={categories} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          All Photos <span className="text-gray-400 text-sm">({photos.length})</span>
        </h2>
        <AdminPhotoList photos={photos} categories={categories} />
      </section>
    </div>
  );
}
