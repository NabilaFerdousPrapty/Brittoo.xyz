
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import BookingModal from "@/components/listings/BookingModal";

// Sample featured items data
const featuredItems = [
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
];

const FeaturedItems = () => {
  const [selectedItem, setSelectedItem] = useState<typeof featuredItems[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const handleBookClick = (item: typeof featuredItems[0]) => {
    setSelectedItem(item);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <section className="py-16">
      <div className="brittoo-container">
        <h2 className="section-title">Featured Items</h2>
        <p className="section-subtitle">
          Browse our top-rated rentals and bartering options
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {featuredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <Link to={`/listings/${item.id}`}>
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
              </Link>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/listings/${item.id}`} className="hover:text-brittoo-green">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                    </Link>
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
                      <Link to={`/listings/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
            asChild
          >
            <Link to="/listings">View All Listings</Link>
          </Button>
        </div>
      </div>

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
    </section>
  );
};

export default FeaturedItems;
