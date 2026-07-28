import { prisma } from "@/lib/prisma";
import { updateCategory } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });

  if (!category) notFound();

  return (
    <main className="mx-auto max-w-xl text-gray-900">
      <Link
        href="/admin/categories"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to categories
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Edit Category</h1>
      <p className="mt-1 text-sm text-gray-500">
        Update the category name used by the catalog.
      </p>

      <form
        action={updateCategory}
        className="mt-7 space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={category.id} />

        <label className="block text-sm font-medium text-gray-700">
          <span className="mb-1.5 block">Category name</span>
          <input
            required
            type="text"
            name="name"
            defaultValue={category.name}
            placeholder="Category Name"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
          >
            Update Category
          </button>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
