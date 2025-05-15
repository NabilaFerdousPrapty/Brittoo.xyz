
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQ from "@/components/home/FAQ";

const FAQPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="brittoo-container py-12">
          <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
