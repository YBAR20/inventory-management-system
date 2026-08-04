import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, Menu } from 'lucide-react';

export const Navbar = ({ setMobileOpen }) => {
  const { searchQuery, handleSearch, setActivePage, activeBranch, currentUser } = useApp();

  const handleQuickSell = () => {
    if (currentUser?.sysRole === 'employee') {
      setActivePage('branchDetailPage');
    } else {
      if (activeBranch) {
        setActivePage('branchDetailPage');
      } else {
        alert("Please select a branch from the 'Branch Locator' first to use POS.");
        setActivePage('businessPage');
      }
    }
  };

  return (
    <header className="flex justify-between items-center bg-white px-4 md:px-8 py-3 shadow-sm z-10 shrink-0 gap-2">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMobileOpen(prev => !prev)} 
          className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="font-semibold text-xs md:text-sm text-primary truncate">Inventory & Retail Hub</div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative w-40 sm:w-60 md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search item across branches..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-accent transition"
          />
        </div>
        <button
          onClick={handleQuickSell}
          className="bg-danger hover:bg-red-600 text-white font-bold py-2 px-3 md:px-5 rounded-full text-xs flex items-center gap-1.5 transition transform hover:scale-105 shadow-md shrink-0"
        >
          <ShoppingCart className="h-4 w-4" /> <span className="hidden sm:inline">Quick Sell</span>
        </button>
      </div>
    </header>
  );
};