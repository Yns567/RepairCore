import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/store/SearchBar";
import ProductCard from "@/components/store/ProductCard";
import { hardwareCategorySlugs } from "@/lib/catalog";

export default async function HardwarePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      category: { in: hardwareCategorySlugs },
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">Repair Hardware</h1>

      <p className="mt-4 text-slate-400">
        Repair tools, programmers, boxes, spare parts and accessories for your workbench.
      </p>

      <div className="mt-8">
        <SearchBar path="/hardware" />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          No matching products right now.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      )}
    </main>
  );
}
