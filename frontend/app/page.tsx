import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import WhyUs from "@/components/home/WhyUs";
import TrendingProducts from "@/components/home/TrendingProducts";
import CtaBand from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <main className="bg-[#070D18]">
      <Hero />
      <Categories />
      <WhyUs />
      <TrendingProducts />
      <CtaBand />
    </main>
  );
}
