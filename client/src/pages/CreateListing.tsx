
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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

const CreateListing = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [dailyRentalPrice, setDailyRentalPrice] = useState("");
  const [dailyCredits, setDailyCredits] = useState("");
  const [location, setLocation] = useState("");
  const [isForRent, setIsForRent] = useState(true);
  const [isForBarter, setIsForBarter] = useState(true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!title || !description || !category || !marketPrice || !location) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    if (!isForRent && !isForBarter) {
      toast.error("Please select at least one rental option (cash or credits)");
      setIsSubmitting(false);
      return;
    }
    
    if (isForRent && !dailyRentalPrice) {
      toast.error("Please enter a daily rental price");
      setIsSubmitting(false);
      return;
    }
    
    if (isForBarter && !dailyCredits) {
      toast.error("Please enter daily credits");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Your listing has been created and is pending approval");
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="brittoo-container py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-4">Create a New Listing</h1>
              <p className="text-gray-600">
                Share your items with the community and start earning money or credits
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Item Title <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Professional DSLR Camera"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your item's condition, features, etc."
                    className="min-h-32"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="marketPrice">
                      Market Value <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="marketPrice"
                      type="number"
                      min="0"
                      value={marketPrice}
                      onChange={(e) => setMarketPrice(e.target.value)}
                      placeholder="e.g. 500"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Approximate retail value of your item in USD
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Boston University, MIT Campus"
                    required
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4">Rental Options</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="isForRent"
                        checked={isForRent}
                        onCheckedChange={(checked) => setIsForRent(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="isForRent" 
                          className="text-base font-medium cursor-pointer"
                        >
                          Rent for cash
                        </Label>
                        <p className="text-sm text-gray-500">
                          Allow users to rent this item for money
                        </p>
                        {isForRent && (
                          <div className="mt-3">
                            <Label htmlFor="dailyRentalPrice" className="text-sm">
                              Daily rental price (USD)
                            </Label>
                            <Input
                              id="dailyRentalPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              value={dailyRentalPrice}
                              onChange={(e) => setDailyRentalPrice(e.target.value)}
                              placeholder="e.g. 25.00"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="isForBarter"
                        checked={isForBarter}
                        onCheckedChange={(checked) => setIsForBarter(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="isForBarter" 
                          className="text-base font-medium cursor-pointer"
                        >
                          Rent for credits
                        </Label>
                        <p className="text-sm text-gray-500">
                          Allow users to rent this item using Brittoo credits
                        </p>
                        {isForBarter && (
                          <div className="mt-3">
                            <Label htmlFor="dailyCredits" className="text-sm">
                              Daily credits required
                            </Label>
                            <Input
                              id="dailyCredits"
                              type="number"
                              min="0"
                              value={dailyCredits}
                              onChange={(e) => setDailyCredits(e.target.value)}
                              placeholder="e.g. 100"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Create Listing"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateListing;
