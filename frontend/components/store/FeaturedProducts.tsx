import { prisma } from "@/lib/prisma";
import ProductCard from "./ProductCard";

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="bg-[#0B1220] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-blue-400 font-semibold">
              Featured Collection
            </p>

            <h2 className="mt-2 text-4xl font-bold text-white">
              Featured Products
            </h2>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              category={product.category ?? "Unknown"}
              price={`$${product.price.toString()}`}
              stock={product.stock > 0 ? "In Stock" : "Out of Stock"}
              image={product.image}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
