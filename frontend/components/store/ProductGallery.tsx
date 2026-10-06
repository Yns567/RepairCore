"use client";

import Image from "next/image";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

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
  const { t } = useT();
  const availableImages = images.length > 0 ? images : ["/placeholder.svg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage =
    availableImages[selectedIndex] ?? availableImages[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white sm:aspect-[4/3] lg:aspect-square">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={t("product.image", { name: productName, index: selectedIndex + 1 })}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 sm:p-10"
        />
        {category && (
          <span className="absolute start-3 top-3 rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            {category}
          </span>
        )}
      </div>

      {/* Thumbnails only make sense when there is more than one picture. */}
      {availableImages.length > 1 && (
        <div className="flex gap-2">
          {availableImages.map((image, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={t("product.image", { name: productName, index: index + 1 })}
                aria-pressed={isSelected}
                className={`relative h-16 w-16 overflow-hidden rounded-lg bg-white p-1 transition sm:h-20 sm:w-20 ${
                  isSelected ? "ring-2 ring-blue-500" : "opacity-70 ring-1 ring-slate-700 hover:opacity-100"
                }`}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-contain p-1" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
