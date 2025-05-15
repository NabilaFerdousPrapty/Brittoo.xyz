
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step = ({ number, title, description, isLast = false }: StepProps) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-4">
      <div className="flex items-center justify-center rounded-full bg-brittoo-green text-white w-8 h-8 font-bold">
        {number}
      </div>
      {!isLast && (
        <div className="h-full w-0.5 bg-brittoo-green opacity-30 mt-2"></div>
      )}
    </div>
    <div className={cn("pb-8", isLast ? "" : "")}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="brittoo-container">
        <h2 className="section-title">How Brittoo Works</h2>
        <p className="section-subtitle">
          Our platform makes it easy to rent items with cash or credits earned by renting your own items. 
          Join our community to reduce waste and get access to more while owning less.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-bold mb-6 text-brittoo-green">Renting Items</h3>
            <div className="space-y-2">
              <Step
                number={1}
                title="Browse Listings"
                description="Explore our categorized and verified listings to find what you need."
              />
              <Step
                number={2}
                title="Choose Payment Method"
                description="Decide whether to pay with cash deposit or use your earned credits."
              />
              <Step
                number={3}
                title="Arrange Pickup"
                description="Coordinate with the owner for a convenient pickup location and time."
              />
              <Step
                number={4}
                title="Return & Review"
                description="Return the item in good condition and leave a review about your experience."
                isLast
              />
            </div>
            
            <div className="mt-6 flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-brittoo-green flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <span className="font-medium">Safety First:</span> All rentals are covered by our damage waiver system to protect both parties.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-bold mb-6 text-brittoo-green">Listing Your Items</h3>
            <div className="space-y-2">
              <Step
                number={1}
                title="Create a Listing"
                description="Add details, photos, and set your rental price or credit requirements."
              />
              <Step
                number={2}
                title="Get Verified"
                description="Our team reviews your listing to ensure quality and accuracy."
              />
              <Step
                number={3}
                title="Respond to Requests"
                description="Accept rental requests and arrange item handover details."
              />
              <Step
                number={4}
                title="Earn & Grow"
                description="Collect cash or earn credits while building your trust profile."
                isLast
              />
            </div>
            
            <div className="mt-6 flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-brittoo-green flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <span className="font-medium">Build Trust:</span> Higher trust levels unlock better opportunities and features on the platform.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-4 text-center">Credit System Explained</h3>
          <p className="text-center text-gray-600 mb-8">
            Our credit system enables a true sharing economy where your contributions
            are rewarded and can be used to access other community resources.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="bg-brittoo-green-light p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-brittoo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Earn Credits</h4>
              <p className="text-gray-600 text-sm">
                List your items and earn credits when others rent them based on item value.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-brittoo-green-light p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-brittoo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Spend Credits</h4>
              <p className="text-gray-600 text-sm">
                Use earned credits to rent items without paying cash deposits.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-brittoo-green-light p-4 inline-block rounded-full mb-4">
                <svg className="w-8 h-8 text-brittoo-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Gain Trust</h4>
              <p className="text-gray-600 text-sm">
                Build trust through successful rentals and earn badges that increase your opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
