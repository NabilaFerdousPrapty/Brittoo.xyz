
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HowItWorks from "@/components/home/HowItWorks";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="brittoo-container py-12">
          <h1 className="text-4xl font-bold text-center mb-12">How It Works</h1>
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
