import { Blog } from "@/components/home/BlogSection";
import Contact from "@/components/home/Contact";
import FAQ from "@/components/home/Faq";
import Hero from "@/components/home/Hero";
import { Presentation } from "@/components/home/Presentation";
import Services from "@/components/home/Services";
import { Testimonials } from "@/components/home/Testimonials";
import { Footer } from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import Configurator from "@/components/tuning/Configurator";

import Image from "next/image";

export default function Home() {
  return (
    <main>
    <Navigation />
    <Hero />
    <Services />
    <Presentation />
    <Configurator/>
    <Blog />
    <Testimonials/>
    <Contact/>
    <FAQ/>
    <Footer/>
  </main>
  );
}
