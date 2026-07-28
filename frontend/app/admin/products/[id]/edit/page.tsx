import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogCategories, getCatalogCategoryLabel } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  const product = Number.isSafeInteger(productId)
    ? await prisma.product.findUnique({ where: { id: productId } })
    : null;
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="text-sm font-medium text-blue-600 hover:underline">← Back to products</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">Edit product</h1>
      <p className="mt-1 text-sm text-gray-500">Update the catalog and stock information.</p>

      <form action={updateProduct.bind(null, product.id, product.version)} className="mt-7 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Field label="Product name"><input required name="name" defaultValue={product.name} className="field" /></Field>
        <Field label="URL slug"><input required name="slug" defaultValue={product.slug} className="field" /></Field>
        <Field label="Description"><textarea name="description" defaultValue={product.description ?? ""} rows={5} className="field" /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price ($)"><input required name="price" type="number" min="0" step="0.01" defaultValue={product.price.toString()} className="field" /></Field>
          <Field label="Stock"><input required name="stock" type="number" min="0" step="1" defaultValue={product.stock} className="field" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select name="category" defaultValue={product.category ?? "programmers"} className="field">
              {product.category &&
                !catalogCategories.some((category) => category.slug === product.category) && (
                  <option value={product.category}>{getCatalogCategoryLabel(product.category)}</option>
                )}
              {catalogCategories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Brand"><input name="brand" defaultValue={product.brand ?? ""} className="field" /></Field>
        </div>
        <Field label="Part number"><input name="partNumber" defaultValue={product.partNumber ?? ""} className="field" /></Field>
        {product.image && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Current image</span>
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
              <Image
                src={product.image}
                alt={product.name}
                width={144}
                height={144}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}
        <Field label={product.image ? "Replace image (optional)" : "Upload image (optional)"}>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700" />
          <span className="mt-1.5 block text-xs font-normal text-gray-400">
            JPG, PNG, or WebP up to 4 MB. Leave empty to keep the current image.
          </span>
        </Field>
        <div className="flex gap-3 border-t border-gray-100 pt-5">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Save changes</button>
          <Link href="/admin/products" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700"><span className="mb-1.5 block">{label}</span>{children}</label>;
}
