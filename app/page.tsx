import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Features from "@/components/landing/Features";
import Security from "@/components/landing/Security";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Features />
        <Security />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
