import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/store/SearchBar";
import ProductCard from "@/components/store/ProductCard";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold">
        Store
      </h1>

      <p className="mt-4 text-gray-600">
        Repair tools, boxes, programmers and spare parts.
      </p>

      <div className="mt-8">
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            category={product.category ?? "Unknown"}
            price={product.price.toString()}
            stock={product.stock > 0 ? "In Stock" : "Out of Stock"}
            image={product.image}
            slug={product.slug}
          />
        ))}
      </div>
    </main>
  );
}
