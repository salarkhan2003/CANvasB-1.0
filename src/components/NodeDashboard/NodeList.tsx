import React from 'react';
import { ECUNode } from '../../types';
import { 
  Cpu, 
  Activity, 
  AlertCircle, 
  Power, 
  Gauge,
  Thermometer,
  Zap
} from 'lucide-react';

interface NodeListProps {
  nodes: ECUNode[];
  onUpdateNodeStatus: (nodeId: string, status: 'active' | 'inactive' | 'error') => void;
}

export const NodeList: React.FC<NodeListProps> = ({ nodes, onUpdateNodeStatus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-success-500" />;
      case 'inactive': return <Power className="w-4 h-4 text-warning-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-error-500" />;
      default: return <Cpu className="w-4 h-4 text-dark-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-500/10 text-success-500 border-success-500/20';
      case 'inactive': return 'bg-warning-500/10 text-warning-500 border-warning-500/20';
      case 'error': return 'bg-error-500/10 text-error-500 border-error-500/20';
      default: return 'bg-dark-500/10 text-dark-400 border-dark-500/20';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Engine': return <Gauge className="w-5 h-5" />;
      case 'Brake': return <Zap className="w-5 h-5" />;
      case 'Sensor': return <Thermometer className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:bg-dark-750 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                {getNodeIcon(node.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{node.name}</h3>
                <p className="text-sm text-dark-400">{node.type} ECU</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(node.status)}`}>
                {getStatusIcon(node.status)}
                <span>{node.status.toUpperCase()}</span>
              </div>
              
              <select
                value={node.status}
                onChange={(e) => onUpdateNodeStatus(node.id, e.target.value as any)}
                className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(node.parameters).map(([param, value]) => (
              <div key={param} className="bg-dark-900 p-3 rounded-lg">
                <div className="text-sm text-dark-400 capitalize mb-1">{param}</div>
                <div className="text-lg font-mono text-white">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {nodes.length === 0 && (
        <div className="flex items-center justify-center h-full text-dark-400">
          <div className="text-center">
            <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No ECU nodes configured</p>
            <p className="text-sm mt-1">Add your first node to start simulation</p>
          </div>
        </div>
      )}
    </div>
  );
};