import Link from "next/link";
import { notFound } from "next/navigation";
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

      <form action={updateProduct.bind(null, product.id)} encType="multipart/form-data" className="mt-7 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Field label="Product name"><input required name="name" defaultValue={product.name} className="field" /></Field>
        <Field label="URL slug"><input required name="slug" defaultValue={product.slug} className="field" /></Field>
        <Field label="Description"><textarea name="description" defaultValue={product.description ?? ""} rows={5} className="field" /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price ($)"><input required name="price" type="number" min="0" step="0.01" defaultValue={product.price.toString()} className="field" /></Field>
          <Field label="Stock"><input required name="stock" type="number" min="0" step="1" defaultValue={product.stock} className="field" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category"><input name="category" defaultValue={product.category ?? ""} className="field" /></Field>
          <Field label="Brand"><input name="brand" defaultValue={product.brand ?? ""} className="field" /></Field>
        </div>
        <Field label="Part number"><input name="partNumber" defaultValue={product.partNumber ?? ""} className="field" /></Field>
        <Field label="Replace image"><input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700" /></Field>
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
