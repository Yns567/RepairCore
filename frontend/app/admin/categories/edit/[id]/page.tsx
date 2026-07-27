import { prisma } from "@/lib/prisma";
import { updateCategory } from "../../actions";
import { notFound } from "next/navigation";

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
    <main className="mx-auto max-w-xl text-slate-200">
      <h1 className="mb-8 text-2xl font-bold">Edit Category</h1>

      <form action={updateCategory} className="space-y-5">
        <input type="hidden" name="id" value={category.id} />

        <input
          type="text"
          name="name"
          defaultValue={category.name}
          placeholder="Category Name"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-200 placeholder:text-slate-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
        >
          Update Category
        </button>
      </form>
    </main>
  );
}
