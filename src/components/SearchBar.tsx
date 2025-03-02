import React, { useState } from 'react';
import { Button } from './ui/button';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Determine what type of data the user is searching for
    if (/^0x[a-fA-F0-9]{64}$/.test(searchQuery)) {
      // It's likely a transaction hash
      window.location.hash = `/tx/${searchQuery}`;
    } else if (/^0x[a-fA-F0-9]{40}$/.test(searchQuery)) {
      // It's likely an address
      window.location.hash = `/address/${searchQuery}`;
    } else if (/^\d+$/.test(searchQuery)) {
      // It's likely a block number
      window.location.hash = `/block/${searchQuery}`;
    } else {
      // Invalid input
      alert('Invalid search query. Please enter a valid block number, transaction hash, or address.');
    }
    
    // Clear the search input
    setSearchQuery('');
  };
  
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Block / Tx Hash / Address"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button type="submit">Search</Button>
      </form>
    </div>
  );
}