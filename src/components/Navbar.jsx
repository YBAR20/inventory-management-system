import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart } from 'lucide-react';

export const Navbar = () => {
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
    <header className="flex justify-between items-center bg-white px-8 py-3 shadow-sm z-10 shrink-0">
      <div className="font-semibold text-sm text-primary">Inventory & Retail Hub</div>
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search item across all branches..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-accent transition"
          />
        </div>
        <button
          onClick={handleQuickSell}
          className="bg-danger hover:bg-red-600 text-white font-bold py-2 px-5 rounded-full text-xs flex items-center gap-2 transition transform hover:scale-105 shadow-md"
        >
          <ShoppingCart className="h-4 w-4" /> Quick Sell
        </button>
      </div>
    </header>
  );
};