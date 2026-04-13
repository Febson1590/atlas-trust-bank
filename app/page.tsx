import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Products from "@/components/landing/Products";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Products />
        <DashboardPreview />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
