
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "../auth/AuthModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // For demo purposes

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLoginModal = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Temp function for demo purposes
  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/f7b82ff7-b29b-42c3-b6e0-a38f9bcda2a8.png" 
                alt="Brittoo Logo" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-brittoo-green">
              Home
            </Link>
            <Link to="/listings" className="text-gray-600 hover:text-brittoo-green">
              Browse
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-brittoo-green">
              How It Works
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-brittoo-green">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-brittoo-green">
              Contact
            </Link>

            {!isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={openLoginModal}
                >
                  Log In
                </Button>
                <Button 
                  onClick={openSignupModal}
                  className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/listings/create">Add Listing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <Button variant="ghost" className="mr-2 relative h-10 w-10 rounded-full">
                <Link to="/dashboard">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <button
              onClick={toggleMenu}
              className="text-gray-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-600 hover:text-brittoo-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/listings"
              className="block text-gray-600 hover:text-brittoo-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/how-it-works"
              className="block text-gray-600 hover:text-brittoo-green"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/faq"
              className="block text-gray-600 hover:text-brittoo-green"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className="block text-gray-600 hover:text-brittoo-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {!isLoggedIn ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => {
                    openSignupModal();
                    setIsMenuOpen(false);
                  }}
                  className="bg-brittoo-green hover:bg-brittoo-green-dark text-white"
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
      />
    </nav>
  );
};

export default Navbar;
