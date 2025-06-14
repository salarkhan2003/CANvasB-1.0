import React, { useState } from 'react';
import { ECUNode } from '../../types';
import { NodeList } from './NodeList';
import { AddNodeModal } from './AddNodeModal';
import { Plus } from 'lucide-react';

interface NodeDashboardProps {
  nodes: ECUNode[];
  onAddNode: (name: string, type: any) => void;
  onUpdateNodeStatus: (nodeId: string, status: 'active' | 'inactive' | 'error') => void;
  ecuTypes: readonly string[];
}

export const NodeDashboard: React.FC<NodeDashboardProps> = ({
  nodes,
  onAddNode,
  onUpdateNodeStatus,
  ecuTypes
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Simulated Node Dashboard</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Node</span>
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{nodes.length}</div>
            <div className="text-dark-400">Total Nodes</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-success-500">
              {nodes.filter(n => n.status === 'active').length}
            </div>
            <div className="text-dark-400">Active</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-warning-500">
              {nodes.filter(n => n.status === 'inactive').length}
            </div>
            <div className="text-dark-400">Inactive</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-error-500">
              {nodes.filter(n => n.status === 'error').length}
            </div>
            <div className="text-dark-400">Error</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <NodeList nodes={nodes} onUpdateNodeStatus={onUpdateNodeStatus} />
      </div>
      
      {showAddModal && (
        <AddNodeModal
          ecuTypes={ecuTypes}
          onAdd={onAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};