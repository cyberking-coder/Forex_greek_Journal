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
      <main id="main-content">
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
