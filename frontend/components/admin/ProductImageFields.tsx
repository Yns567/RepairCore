"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_COMBINED_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_INPUT_NAMES = ["image", "image2", "image3"] as const;
const REMOVE_INPUT_NAMES = [
  "removeImage",
  "removeImage2",
  "removeImage3",
] as const;

type ProductImageFieldsProps = {
  currentImages?: Array<string | null>;
  productName?: string;
};

type SelectedImage = {
  name: string;
  previewUrl: string;
};

export default function ProductImageFields({
  currentImages = [null, null, null],
  productName = "Product",
}: ProductImageFieldsProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const previewUrls = useRef(new Set<string>());
  const [selectedImages, setSelectedImages] = useState<
    Array<SelectedImage | null>
  >([null, null, null]);
  const [removed, setRemoved] = useState([false, false, false]);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      for (const previewUrl of previewUrls.current) {
        URL.revokeObjectURL(previewUrl);
      }
      previewUrls.current.clear();
    },
    [],
  );

  const imageCount = currentImages.reduce(
    (count, image, index) =>
      count + (selectedImages[index] || (image && !removed[index]) ? 1 : 0),
    0,
  );

  function clearSelectedImage(index: number) {
    const selectedImage = selectedImages[index];
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.previewUrl);
      previewUrls.current.delete(selectedImage.previewUrl);
    }
    if (inputRefs.current[index]) {
      inputRefs.current[index]!.value = "";
    }
    setSelectedImages((current) =>
      current.map((image, slot) => (slot === index ? null : image)),
    );
    setError(null);
  }

  function handleFileChange(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    if (!file) {
      clearSelectedImage(index);
      return;
    }

    const totalBytes = inputRefs.current.reduce(
      (total, currentInput) =>
        total + (currentInput?.files?.[0]?.size ?? 0),
      0,
    );

    if (file.size > MAX_COMBINED_IMAGE_BYTES || totalBytes > MAX_COMBINED_IMAGE_BYTES) {
      input.value = "";
      clearSelectedImage(index);
      setError(
        "The combined size of images selected in this save must not exceed 4 MB.",
      );
      return;
    }

    const previousImage = selectedImages[index];
    if (previousImage) {
      URL.revokeObjectURL(previousImage.previewUrl);
      previewUrls.current.delete(previousImage.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.add(previewUrl);

    setRemoved((current) =>
      current.map((value, slot) => (slot === index ? false : value)),
    );
    setSelectedImages((current) =>
      current.map((image, slot) =>
        slot === index ? { name: file.name, previewUrl } : image,
      ),
    );
    setError(null);
  }

  function handleRemove(index: number, checked: boolean) {
    if (checked) {
      clearSelectedImage(index);
    }
    setRemoved((current) =>
      current.map((value, slot) => (slot === index ? checked : value)),
    );
    setError(null);
  }

  return (
    <section className="space-y-4 border-t border-gray-100 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Product Images
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            The first image is used as the main store image.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {imageCount}/3 images
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {IMAGE_INPUT_NAMES.map((inputName, index) => {
          const currentImage = currentImages[index] ?? null;
          const selectedImage = selectedImages[index];
          const showCurrentImage =
            currentImage && !removed[index] && !selectedImage;

          return (
            <div
              key={inputName}
              className={`rounded-xl border p-3 ${
                index === 0
                  ? "border-blue-300 bg-blue-50/40"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <label
                  htmlFor={inputName}
                  className="text-sm font-semibold text-gray-800"
                >
                  Image {index + 1}
                </label>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    index === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index === 0 ? "Main" : "Gallery"}
                </span>
              </div>

              <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
                {selectedImage ? (
                  <Image
                    src={selectedImage.previewUrl}
                    alt={`New ${productName} image ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-contain p-2"
                  />
                ) : showCurrentImage ? (
                  <Image
                    src={currentImage}
                    alt={`${productName} image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex max-w-full flex-col items-center gap-2 text-center text-gray-400">
                    <ImagePlus size={28} />
                    <span className="max-w-full truncate px-2 text-xs">
                      {removed[index] ? "Will be removed" : "No image"}
                    </span>
                  </div>
                )}
              </div>

              {selectedImage && (
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className="min-w-0 truncate text-xs text-gray-600"
                    title={selectedImage.name}
                  >
                    {selectedImage.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearSelectedImage(index)}
                    aria-label={`${
                      currentImage ? "Cancel replacement for" : "Clear"
                    } image ${index + 1}`}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-500"
                  >
                    {currentImage ? "Cancel replacement" : "Clear"}
                  </button>
                </div>
              )}

              <input
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={inputName}
                name={inputName}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleFileChange(index, event)}
                className="block w-full text-xs text-gray-600 file:mb-2 file:mr-2 file:w-full file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-50"
              />

              {currentImage && !selectedImage && (
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <input
                    name={REMOVE_INPUT_NAMES[index]}
                    type="checkbox"
                    checked={removed[index]}
                    onChange={(event) =>
                      handleRemove(index, event.currentTarget.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  Remove current image
                </label>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <p className="text-xs leading-5 text-gray-500">
        JPG, PNG, or WebP. The combined size of newly selected images in one
        save must not exceed 4 MB. You can add the remaining images in another
        save if needed. The first available image becomes the main image, and
        removing it promotes the next image.
      </p>
    </section>
  );
}
