import React, { useEffect, useRef } from 'react';
import { CANMessage } from '../../types';
import { Clock, Zap } from 'lucide-react';

interface MessageListProps {
  messages: CANMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      millisecond: true 
    }).slice(0, -3);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error-500 bg-error-500/10';
      case 'medium': return 'text-warning-500 bg-warning-500/10';
      case 'low': return 'text-success-500 bg-success-500/10';
      default: return 'text-dark-400 bg-dark-500/10';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'CAN' ? 'text-primary-400 bg-primary-500/10' : 'text-secondary-400 bg-secondary-500/10';
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-dark-400">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages captured yet</p>
            <p className="text-sm mt-1">Start the simulation to see CAN/LIN traffic</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className="bg-dark-800 border border-dark-700 rounded-lg p-4 hover:bg-dark-750 transition-colors animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded text-xs font-mono ${getTypeColor(message.type)}`}>
                  {message.type}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(message.priority)}`}>
                  {message.priority.toUpperCase()}
                </div>
                <span className="text-dark-400 text-sm font-medium">{message.sender}</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-400 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(message.timestamp)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark-400">Arbitration ID:</span>
                <span className="ml-2 font-mono text-primary-400">{message.arbitrationId}</span>
              </div>
              <div>
                <span className="text-dark-400">DLC:</span>
                <span className="ml-2 font-mono text-white">{message.dlc}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <span className="text-dark-400 text-sm">Data:</span>
              <div className="mt-1 font-mono text-accent-400 bg-dark-900 p-2 rounded border">
                {message.data || 'No data'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};