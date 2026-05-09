import Link from "next/link";
import { CategoryManager } from "@/components/features/CategoryManager";
import { getCategories } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Categories</h1>
          <p className="text-gray-500 mt-1">
            Organize your gallery into albums (e.g. School Days, Reunion Day).
          </p>
        </div>
        <Link href="/admin/gallery" className="btn-secondary text-sm">
          ← Back to Gallery
        </Link>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
