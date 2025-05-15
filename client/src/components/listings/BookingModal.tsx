
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemPrice: number;
  itemCredits: number;
  isForRent: boolean;
  isForBarter: boolean;
}

const BookingModal = ({
  isOpen,
  onClose,
  itemTitle,
  itemPrice,
  itemCredits,
  isForRent,
  isForBarter,
}: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [useCredits, setUseCredits] = useState<boolean>(false);

  const handleBooking = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    // Calculate number of days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Calculate total cost
    const totalCost = useCredits ? itemCredits * diffDays : itemPrice * diffDays;
    const costType = useCredits ? "credits" : "dollars";

    toast.success(
      `Booking confirmed for ${itemTitle} from ${format(startDate, "PPP")} to ${format(
        endDate,
        "PPP"
      )} for a total of ${totalCost} ${costType}`
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {itemTitle}</DialogTitle>
          <DialogDescription>
            Select the dates you'd like to rent this item
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => 
                      date < new Date() || (startDate ? date < startDate : false)
                    }
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isForRent && isForBarter && (
            <div className="flex items-center space-x-4 mt-2">
              <label className="text-sm font-medium">Payment Method:</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!useCredits}
                    onChange={() => setUseCredits(false)}
                    className="h-4 w-4 text-brittoo-green"
                  />
                  <span>Cash (${itemPrice}/day)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={useCredits}
                    onChange={() => setUseCredits(true)}
                    className="h-4 w-4 text-brittoo-green"
                  />
                  <span>Credits ({itemCredits} credits/day)</span>
                </label>
              </div>
            </div>
          )}
          
          {isForRent && !isForBarter && (
            <div className="text-sm mt-2">
              Rental price: ${itemPrice}/day
            </div>
          )}
          
          {!isForRent && isForBarter && (
            <div className="text-sm mt-2">
              Credit cost: {itemCredits} credits/day
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-brittoo-green hover:bg-brittoo-green-dark" onClick={handleBooking}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
