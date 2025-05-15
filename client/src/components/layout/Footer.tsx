
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/f7b82ff7-b29b-42c3-b6e0-a38f9bcda2a8.png" 
                alt="Brittoo Logo" 
                className="h-10 w-auto" 
              />
            </Link>
            <p className="text-gray-600 text-sm max-w-xs">
              Own Less, Access More. A credit-based renting and bartering platform following circular economy principles.
            </p>
            <p className="text-gray-600 font-semibold">brittoo.xyz</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/listings" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-brittoo-green text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/trust-system" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/credit-system" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Credit System
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brittoo-green text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/report-issue" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Give Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/damage-policy" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Damage Waiver Policy
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-brittoo-green text-sm">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Brittoo. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brittoo-green">
                Twitter
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brittoo-green">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brittoo-green">
                Instagram
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brittoo-green">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
