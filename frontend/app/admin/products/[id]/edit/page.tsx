import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProduct } from "../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Edit Product
      </h1>

      <form
        action={updateProduct.bind(null, product.id)}
        className="space-y-5"
      >
        <input
          name="name"
          defaultValue={product.name}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="slug"
          defaultValue={product.slug}
          className="w-full border rounded-lg p-3"
        />

        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          className="w-full border rounded-lg p-3 h-32"
        />

        <input
          name="price"
          type="number"
          defaultValue={product.price.toString()}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="stock"
          type="number"
          defaultValue={product.stock}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="category"
          defaultValue={product.category ?? ""}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="brand"
          defaultValue={product.brand ?? ""}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="partNumber"
          defaultValue={product.partNumber ?? ""}
          className="w-full border rounded-lg p-3"
        />

        <input
          name="image"
          defaultValue={product.image ?? ""}
          className="w-full border rounded-lg p-3"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Update Product
        </button>
      </form>
    </main>
  );
}