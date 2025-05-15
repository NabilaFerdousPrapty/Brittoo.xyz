
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "How does the credit system work?",
    answer:
      "Our credit system allows you to earn credits by renting out your items. These credits can then be used to rent items from other users without paying cash. Credits are non-convertible to cash and are designed to encourage sharing within our community."
  },
  {
    question: "What happens if an item is damaged?",
    answer:
      "We have a damage waiver system in place. If an item is damaged during rental, the borrower is responsible. Depending on the selected payment method, either the security deposit will be used or credits will be deducted. Our admin team reviews all damage claims for fair resolution."
  },
  {
    question: "How is the security deposit determined?",
    answer:
      "Security deposits are typically set at 20-30% of the item's market value. This amount is held securely and returned in full once the item is returned in the same condition as it was rented."
  },
  {
    question: "How does verification work?",
    answer:
      "We verify users through institutional email verification (for university students) and require a selfie during registration. Additionally, all listings undergo verification by our admin team to ensure quality and accuracy."
  },
  {
    question: "What are the trust levels and how do I advance?",
    answer:
      "Our trust system has four levels: Bronze, Silver, Gold, and Platinum. You advance by maintaining positive reviews, completing successful rentals, and following community guidelines. Higher trust levels unlock benefits like reduced security deposits and priority listing visibility."
  },
  {
    question: "How do I report issues with a rental?",
    answer:
      "You can report issues through the 'Report Issue' button available on any active rental. Our support team will review your report and help resolve the situation according to our dispute resolution policy."
  },
];

const FAQ = () => {
  return (
    <section className="py-16 bg-white">
      <div className="brittoo-container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Find answers to common questions about using Brittoo's rental platform
        </p>
        
        <div className="max-w-3xl mx-auto mt-8">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <Button asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
