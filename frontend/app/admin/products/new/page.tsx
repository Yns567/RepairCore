import Link from "next/link";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Add Product
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to list a new product in the store.
        </p>
      </div>

      <form
        action={createProduct}
        className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Basic Information
          </h2>

          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="e.g. UMT Dongle Box"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Slug
            </label>
            <input
              id="slug"
              type="text"
              name="slug"
              required
              placeholder="e.g. umt-dongle-box"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Used in the product URL. Lowercase, no spaces (use dashes).
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Short description shown on the product page"
              className="h-32 w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* Pricing & inventory */}
        <section className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Pricing &amp; Inventory
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Classification */}
        <section className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Classification
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue="hardware"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="tools">Tools</option>
                <option value="spare-parts">Spare Parts</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="brand"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Brand
              </label>
              <input
                id="brand"
                type="text"
                name="brand"
                placeholder="e.g. UMT, Z3X, Quick"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="partNumber"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Part Number{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="partNumber"
              type="text"
              name="partNumber"
              placeholder="e.g. UMT-2024-A"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* Image */}
        <section className="space-y-4 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Product Image
          </h2>

          <div>
            <label
              htmlFor="image"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, or WebP, ideally square and smaller than 4 MB.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Save Product
          </button>
          <Link
            href="/admin/products"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
