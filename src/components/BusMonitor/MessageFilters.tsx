import React from 'react';
import { Search, Filter } from 'lucide-react';

interface MessageFiltersProps {
  filters: {
    search: string;
    type: 'all' | 'CAN' | 'LIN';
    priority: 'all' | 'high' | 'medium' | 'low';
    sender: string;
  };
  onFiltersChange: (filters: any) => void;
  senders: string[];
}

export const MessageFilters: React.FC<MessageFiltersProps> = ({
  filters,
  onFiltersChange,
  senders
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          placeholder="Search messages, IDs, or data..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-300">Filters:</span>
        </div>
        
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          <option value="CAN">CAN</option>
          <option value="LIN">LIN</option>
        </select>
        
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={filters.sender}
          onChange={(e) => handleFilterChange('sender', e.target.value)}
          className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {senders.map(sender => (
            <option key={sender} value={sender}>
              {sender === 'all' ? 'All Senders' : sender}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};