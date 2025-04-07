import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AdvancedSearch from './AdvancedSearch';

const SearchIcon = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {isSearchOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-md bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <AdvancedSearch onClose={() => setIsSearchOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default SearchIcon; 