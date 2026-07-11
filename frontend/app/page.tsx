import Hero from "@/components/home/Hero";
import Categories from "@/components/layout/Categories";
import FeaturedProducts from "@/components/store/FeaturedProducts";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1220]">
      <Hero />
      <Categories />
      <FeaturedProducts />
    </main>
  );
}