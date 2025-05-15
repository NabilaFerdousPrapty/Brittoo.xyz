
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const categories = [
    "Tech & Electronics",
    "Outdoor Gear",
    "Tools",
    "Appliances",
    "Sports Equipment",
    "Clothing",
    "Books",
    "Furniture"
  ];

  return (
    <section className="bg-gradient-to-b from-brittoo-green-light to-white">
      <div className="brittoo-container pt-12 md:pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-brittoo-green">Own Less,</span> Access More
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rent, Barter, and Share items in your community. 
            Earn credits by lending your items or pay with cash.
            Join the circular economy today.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-12">
            <Button 
              size="lg" 
              className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
              onClick={() => navigate("/listings")}
            >
              Find Items to Rent
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-brittoo-green text-brittoo-green hover:bg-brittoo-green-light"
              onClick={() => navigate("/listings/create")}
            >
              List Your Items
            </Button>
          </div>
          
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="What do you want to rent?"
                className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brittoo-green focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brittoo-green hover:bg-brittoo-green-dark text-white p-2 rounded-full"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          <div className="hidden md:flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className="rounded-full bg-white hover:bg-brittoo-green-light border border-gray-200 shadow-sm"
                onClick={() => navigate(`/listings?category=${encodeURIComponent(category)}`)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
