import React, { useState, useMemo } from 'react';
import { CANMessage } from '../../types';
import { MessageList } from './MessageList';
import { MessageFilters } from './MessageFilters';
import { SmartDataAnalyzer } from '../AI/SmartDataAnalyzer';

interface BusMonitorProps {
  messages: CANMessage[];
}

export const BusMonitor: React.FC<BusMonitorProps> = ({ messages }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'CAN' | 'LIN',
    priority: 'all' as 'all' | 'high' | 'medium' | 'low',
    sender: 'all'
  });

  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = filters.search === '' || 
        message.arbitrationId.toLowerCase().includes(filters.search.toLowerCase()) ||
        message.data.toLowerCase().includes(filters.search.toLowerCase()) ||
        message.sender.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = filters.type === 'all' || message.type === filters.type;
      const matchesPriority = filters.priority === 'all' || message.priority === filters.priority;
      const matchesSender = filters.sender === 'all' || message.sender === filters.sender;
      
      return matchesSearch && matchesType && matchesPriority && matchesSender;
    });
  }, [messages, filters]);

  const senders = useMemo(() => {
    const uniqueSenders = Array.from(new Set(messages.map(m => m.sender)));
    return ['all', ...uniqueSenders];
  }, [messages]);

  // Prepare data for AI analysis
  const analysisData = useMemo(() => {
    const messagesByType = messages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const messagesBySender = messages.reduce((acc, msg) => {
      acc[msg.sender] = (acc[msg.sender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorMessages = messages.filter(msg => msg.errorFlags && msg.errorFlags.length > 0);
    const recentMessages = messages.slice(-100);
    
    return {
      totalMessages: messages.length,
      messagesByType,
      messagesBySender,
      errorCount: errorMessages.length,
      errorRate: messages.length > 0 ? (errorMessages.length / messages.length) * 100 : 0,
      recentMessageRate: recentMessages.length,
      uniqueSenders: Object.keys(messagesBySender).length,
      averageMessageSize: messages.length > 0 ? messages.reduce((acc, msg) => acc + msg.dlc, 0) / messages.length : 0,
      busLoad: Math.min(100, (messages.length / 1000) * 100),
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].timestamp : null
    };
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <h2 className="text-xl font-semibold text-white mb-4">Real-time Bus Monitor</h2>
        <MessageFilters 
          filters={filters}
          onFiltersChange={setFilters}
          senders={senders}
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Message List - 60% width */}
        <div className="w-3/5 flex flex-col border-r border-dark-700">
          <MessageList messages={filteredMessages} />
          
          <div className="p-4 bg-dark-800 border-t border-dark-700">
            <div className="flex items-center justify-between text-sm text-dark-400">
              <span>{filteredMessages.length} messages displayed</span>
              <span>Real-time monitoring active</span>
            </div>
          </div>
        </div>
        
        {/* AI Analysis Panel - 40% width */}
        <div className="w-2/5 overflow-y-auto p-6">
          <SmartDataAnalyzer 
            data={analysisData}
            context="monitor"
            autoRefresh={true}
            refreshInterval={10000}
          />
        </div>
      </div>
    </div>
  );
};