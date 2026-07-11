import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ProductCardProps = {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string | null;
  slug: string;
};

export default function ProductCard({
  id,
  name,
  category,
  price,
  stock,
  image,
  slug,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl">

        <Link href={`/products/${slug}`} className="block">
          <div className="relative h-64 bg-[#0F172A]">
          <Image
            src={image || "/placeholder.png"}
            alt={name}
            fill
            className="object-contain p-6 transition duration-500 group-hover:scale-110"
          />

          <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {category}
          </span>
          </div>
        </Link>

        <div className="space-y-4 p-6">

          <Link href={`/products/${slug}`} className="block">
            <h3 className="line-clamp-2 text-xl font-bold text-white transition group-hover:text-blue-400">
              {name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">

            <span className="text-2xl font-bold text-blue-400">
              {price}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                stock === "In Stock"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {stock}
            </span>

          </div>

          <AddToCartButton
            productId={id}
            disabled={stock !== "In Stock"}
            fullWidth
          />

        </div>

    </div>
  );
}
