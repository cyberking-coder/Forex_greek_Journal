import {
  Navbar,
  Hero,
  Features,
  Community,
  Pricing,
  Faq,
  Contact,
  Footer,
} from "@/components/marketing";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Community />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
