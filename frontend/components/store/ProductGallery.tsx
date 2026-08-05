"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  category?: string | null;
};

export default function ProductGallery({
  images,
  productName,
  category,
}: ProductGalleryProps) {
  const availableImages = images.length > 0 ? images : ["/placeholder.svg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage =
    availableImages[selectedIndex] ?? availableImages[0];

  return (
    <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-5">
      <div className="flex flex-col gap-3 pt-3">
        {availableImages.map((image, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-pressed={isSelected}
              className={`relative aspect-square overflow-hidden rounded-lg bg-slate-50 p-1.5 transition ${
                isSelected
                  ? "border-2 border-blue-600 shadow-sm"
                  : "border border-slate-200 opacity-75 hover:border-blue-300 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          );
        })}
      </div>

      <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-xl bg-[#f7f9fd] p-6 sm:min-h-[455px] sm:p-10">
        <div className="absolute h-4/5 w-4/5 rounded-full bg-blue-100/70 blur-3xl" />
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={`${productName} image ${selectedIndex + 1}`}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="relative object-contain p-4"
        />
        {category && (
          <span className="absolute left-4 top-4 rounded-md bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm ring-1 ring-slate-200">
            {category}
          </span>
        )}
      </div>
    </div>
  );
}
