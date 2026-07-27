import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <main className="mx-auto max-w-xl text-slate-200">
      <h1 className="mb-8 text-2xl font-bold">Add Category</h1>

      <form action={createCategory} className="space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-200 placeholder:text-slate-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
        >
          Save Category
        </button>
      </form>
    </main>
  );
}
