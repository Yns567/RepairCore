import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Products Management
        </h1>

        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Add Product
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Stock</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.category}</td>
              <td className="p-3">
                ${product.price.toString()}
              </td>
              <td className="p-3">{product.stock}</td>
              <td className="p-3 flex gap-3">
                <a
                  href={`/admin/products/${product.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </a>
                <form action={deleteProduct.bind(null, product.id)} className="inline">
                  <button type="submit" className="text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}