
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import BookingModal from "@/components/listings/BookingModal";

// Using the same sample data from FeaturedItems component
const listingsData = [
  {
    id: 1,
    title: "Professional DSLR Camera",
    category: "Tech & Electronics",
    imgSrc: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    price: 25,
    credits: 100,
    location: "Boston University",
    rating: 4.8,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 2,
    title: "Mountain Bike - Trail Model",
    category: "Outdoor Gear",
    imgSrc: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    price: 15,
    credits: 60,
    location: "MIT Campus",
    rating: 4.5,
    isForRent: true,
    isForBarter: false,
  },
  {
    id: 3,
    title: "Professional Power Drill Set",
    category: "Tools",
    imgSrc: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    price: 10,
    credits: 40,
    location: "Harvard Square",
    rating: 4.9,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 4,
    title: "Modern Coffee Table",
    category: "Furniture",
    imgSrc: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    price: 8,
    credits: 35,
    location: "Cambridge",
    rating: 4.6,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 5,
    title: "MacBook Pro 16-inch",
    category: "Tech & Electronics",
    imgSrc: "https://images.unsplash.com/photo-1532198528077-0e8bbe7c7c75",
    price: 40,
    credits: 160,
    location: "Northeastern University",
    rating: 4.9,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 6,
    title: "Camping Tent (4-Person)",
    category: "Outdoor Gear",
    imgSrc: "https://images.unsplash.com/photo-1600184894548-75858fec6437",
    price: 18,
    credits: 70,
    location: "Boston College",
    rating: 4.7,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 7,
    title: "Electric Guitar",
    category: "Musical Instruments",
    imgSrc: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0",
    price: 20,
    credits: 80,
    location: "Berklee College",
    rating: 4.8,
    isForRent: true,
    isForBarter: true,
  },
  {
    id: 8,
    title: "Lawn Mower",
    category: "Tools",
    imgSrc: "https://images.unsplash.com/photo-1589345343328-b9c6efa5fab7",
    price: 15,
    credits: 55,
    location: "Somerville",
    rating: 4.3,
    isForRent: true,
    isForBarter: false,
  },
];

const categories = [
  "Tech & Electronics",
  "Outdoor Gear",
  "Tools",
  "Appliances",
  "Sports Equipment",
  "Clothing",
  "Books",
  "Furniture",
  "Musical Instruments",
];

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedItem, setSelectedItem] = useState<typeof listingsData[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Filter listings based on search and category
  const filteredListings = listingsData.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === "" || 
      item.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ 
      search: searchTerm,
      ...(selectedCategory ? { category: selectedCategory } : {})
    });
  };
  
  const handleCategorySelect = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(newCategory);
    setSearchParams({ 
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(newCategory ? { category: newCategory } : {})
    });
  };

  const handleBookClick = (item: typeof listingsData[0]) => {
    setSelectedItem(item);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-brittoo-green-light py-10">
          <div className="brittoo-container">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Browse Items</h1>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="What are you looking for?"
                  className="pl-4 pr-10 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brittoo-green focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-brittoo-green hover:bg-brittoo-green-dark text-white p-2 rounded-full"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="brittoo-container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters sidebar */}
            <div className="md:w-64 shrink-0">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h2 className="font-semibold text-lg mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={category === selectedCategory ? "default" : "outline"}
                      className={`justify-start w-full ${
                        category === selectedCategory 
                          ? "bg-brittoo-green hover:bg-brittoo-green-dark text-white" 
                          : "hover:bg-brittoo-green-light"
                      }`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {(selectedCategory || searchTerm) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      variant="ghost"
                      className="w-full justify-start text-gray-600"
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setSearchParams({});
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Results */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-lg font-medium">
                  {filteredListings.length} {filteredListings.length === 1 ? "result" : "results"} found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <a href={`/listings/${item.id}`} className="block">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={item.imgSrc} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {item.isForRent && (
                            <Badge variant="secondary" className="bg-white text-brittoo-green border border-brittoo-green">
                              Cash
                            </Badge>
                          )}
                          {item.isForBarter && (
                            <Badge className="bg-brittoo-green text-white">
                              Credits
                            </Badge>
                          )}
                        </div>
                      </div>
                    </a>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <a href={`/listings/${item.id}`} className="hover:text-brittoo-green">
                            <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                          </a>
                          <span className="text-sm text-gray-500">{item.category}</span>
                        </div>
                        <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-sm">
                          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          {item.rating}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {item.location}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          {item.isForRent && (
                            <div className="font-semibold text-gray-900">
                              ${item.price} <span className="text-sm font-normal text-gray-500">/day</span>
                            </div>
                          )}
                          {item.isForBarter && (
                            <div className="text-brittoo-green font-semibold">
                              {item.credits} credits <span className="text-sm font-normal text-gray-500">/day</span>
                            </div>
                          )}
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-brittoo-green text-brittoo-green hover:bg-brittoo-green-light"
                            onClick={() => handleBookClick(item)}
                          >
                            Book
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
                            asChild
                          >
                            <a href={`/listings/${item.id}`}>View</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredListings.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No items found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button 
                    onClick={() => {
                      setSelectedCategory("");
                      setSearchTerm("");
                      setSearchParams({});
                    }}
                    className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Booking Modal */}
      {selectedItem && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          itemTitle={selectedItem.title}
          itemPrice={selectedItem.price}
          itemCredits={selectedItem.credits}
          isForRent={selectedItem.isForRent}
          isForBarter={selectedItem.isForBarter}
        />
      )}
    </div>
  );
};

export default Listings;
