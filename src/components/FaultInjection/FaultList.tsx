import React from 'react';
import { FaultInjection } from '../../types';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Trash2
} from 'lucide-react';

interface FaultListProps {
  faults: FaultInjection[];
  onToggleFault: (faultId: string) => void;
  onRemoveFault: (faultId: string) => void;
}

export const FaultList: React.FC<FaultListProps> = ({ 
  faults, 
  onToggleFault,
  onRemoveFault 
}) => {
  const getFaultIcon = (type: string) => {
    switch (type) {
      case 'bit_error': return <Zap className="w-5 h-5" />;
      case 'bus_off': return <Power className="w-5 h-5" />;
      case 'dominant_flip': return <ToggleRight className="w-5 h-5" />;
      case 'timeout': return <Clock className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-error-500 bg-error-500/10 border-error-500/20';
      case 'medium': return 'text-warning-500 bg-warning-500/10 border-warning-500/20';
      case 'low': return 'text-success-500 bg-success-500/10 border-success-500/20';
      default: return 'text-dark-400 bg-dark-500/10 border-dark-500/20';
    }
  };

  const getFaultTypeLabel = (type: string) => {
    switch (type) {
      case 'bit_error': return 'Bit Error';
      case 'bus_off': return 'Bus Off';
      case 'dominant_flip': return 'Recessive-Dominant Flip';
      case 'timeout': return 'Timeout Scenario';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      {faults.map((fault) => (
        <div
          key={fault.id}
          className={`border rounded-lg p-6 transition-all duration-200 ${
            fault.active 
              ? 'bg-error-500/5 border-error-500/30 shadow-lg shadow-error-500/10' 
              : 'bg-dark-800 border-dark-700 hover:bg-dark-750'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${fault.active ? 'bg-error-500/20 text-error-400' : 'bg-dark-700 text-dark-400'}`}>
                {getFaultIcon(fault.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {getFaultTypeLabel(fault.type)}
                </h3>
                <p className="text-sm text-dark-400">Target: {fault.target}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getSeverityColor(fault.severity)}`}>
                {fault.severity.toUpperCase()}
              </div>
              
              <button
                onClick={() => onToggleFault(fault.id)}
                className={`p-2 rounded-lg transition-colors ${
                  fault.active 
                    ? 'bg-error-600 hover:bg-error-700 text-white' 
                    : 'bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-white'
                }`}
              >
                {fault.active ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => onRemoveFault(fault.id)}
                className="p-2 bg-dark-700 hover:bg-error-600 text-dark-400 hover:text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-dark-900 p-3 rounded-lg">
            <p className="text-dark-300 text-sm">{fault.description}</p>
          </div>
          
          {fault.active && (
            <div className="mt-3 flex items-center space-x-2 text-error-400 text-sm animate-pulse">
              <div className="w-2 h-2 bg-error-500 rounded-full"></div>
              <span>Fault injection active</span>
            </div>
          )}
        </div>
      ))}
      
      {faults.length === 0 && (
        <div className="flex items-center justify-center h-full text-dark-400">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No faults configured</p>
            <p className="text-sm mt-1">Add fault scenarios to test system resilience</p>
          </div>
        </div>
      )}
    </div>
  );
};