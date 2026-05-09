import { adminDb } from "@/lib/firebase/admin";
import type { Photo, PhotoCategory } from "@/types/photo";

/**
 * Server-side: fetch all photos, optionally filtered by categoryId.
 * Returns newest first.
 */
export async function getPhotos(categoryId?: string | null): Promise<Photo[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("photos");
    if (categoryId !== undefined) {
      query = query.where("categoryId", "==", categoryId);
    }
    const snapshot = await query.get();
    const photos: Photo[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Photo, "id">),
    }));
    photos.sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
    return photos;
  } catch (err) {
    console.error("[getPhotos] failed:", err);
    return [];
  }
}

/**
 * Server-side: fetch all categories, sorted by `order` ascending.
 */
export async function getCategories(): Promise<PhotoCategory[]> {
  try {
    const snapshot = await adminDb.collection("photo_categories").get();
    const categories: PhotoCategory[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PhotoCategory, "id">),
    }));
    categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return categories;
  } catch (err) {
    console.error("[getCategories] failed:", err);
    return [];
  }
}

/**
 * Convert a name into a URL-safe slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "category";
}
