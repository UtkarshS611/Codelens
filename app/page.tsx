import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

export default function page() {
  return (
    <main>
      <div className="px-6 sm:px-8 md:px-12 lg:px-24 xl:px-52">
        <Header />
        <Hero />
      </div>
    </main>
  )
}