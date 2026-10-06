import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularServices from "@/components/home/PopularServices";
import TrendingProducts from "@/components/home/TrendingProducts";
import WhyUs from "@/components/home/WhyUs";
import CtaBand from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <main className="bg-[#070D18]">
      <Hero />
      <Categories />
      <PopularServices />
      <TrendingProducts />
      <WhyUs />
      <CtaBand />
    </main>
  );
}
