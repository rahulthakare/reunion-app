export interface PhotoCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
  photoCount?: number;
  createdAt: string;
  createdBy: string;
}

export interface Photo {
  id: string;
  url: string;
  storagePath: string; // for safe deletion from Storage
  alt: string;
  caption?: string;
  width: number;
  height: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName?: string;
  categoryId: string | null;
  categorySlug?: string | null;
}
