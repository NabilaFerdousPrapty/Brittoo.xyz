
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedItems from "@/components/home/FeaturedItems";
import FAQ from "@/components/home/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <FeaturedItems />
        <FAQ />
        
        {/* Trust and Community Section */}
        <section className="py-16 bg-brittoo-green-light">
          <div className="brittoo-container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Circular Economy Community</h2>
              <p className="text-lg mb-8">
                Brittoo is more than just a rental platform. We're building a community of like-minded individuals who believe in reducing waste and maximizing resource utilization.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-brittoo-green text-xl font-bold mb-2">5,000+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-brittoo-green text-xl font-bold mb-2">12,000+</div>
                  <div className="text-gray-600">Items Available</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-brittoo-green text-xl font-bold mb-2">8,500+</div>
                  <div className="text-gray-600">Successful Rentals</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
