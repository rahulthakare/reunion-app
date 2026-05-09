"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PhotoCategory } from "@/types/photo";

interface CategoryFilterProps {
  categories: PhotoCategory[];
  activeSlug?: string;
  basePath?: string;
}

export function CategoryFilter({
  categories,
  activeSlug,
  basePath = "/gallery",
}: CategoryFilterProps) {
  const pathname = usePathname();
  const isAll = !activeSlug && pathname === basePath;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href={basePath}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          isAll
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`${basePath}/${cat.slug}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.icon ? `${cat.icon} ` : ""}{cat.name}
          </Link>
        );
      })}
    </div>
  );
}
