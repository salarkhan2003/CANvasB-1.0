import React, { useState } from 'react';
import { FaultInjection as FaultType } from '../../types';
import { FaultList } from './FaultList';
import { AddFaultModal } from './AddFaultModal';
import { Zap, Plus, AlertTriangle } from 'lucide-react';

export const FaultInjection: React.FC = () => {
  const [faults, setFaults] = useState<FaultType[]>([
    {
      id: 'fault_1',
      type: 'bit_error',
      target: 'Engine ECU',
      active: false,
      severity: 'medium',
      description: 'Single bit error injection in data payload'
    },
    {
      id: 'fault_2',
      type: 'bus_off',
      target: 'Brake ECU',
      active: false,
      severity: 'high',
      description: 'Force node into bus-off state'
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleFault = (faultId: string) => {
    setFaults(prev => prev.map(fault => 
      fault.id === faultId ? { ...fault, active: !fault.active } : fault
    ));
  };

  const addFault = (faultData: Omit<FaultType, 'id'>) => {
    const newFault: FaultType = {
      ...faultData,
      id: `fault_${Date.now()}`
    };
    setFaults(prev => [...prev, newFault]);
  };

  const removeFault = (faultId: string) => {
    setFaults(prev => prev.filter(fault => fault.id !== faultId));
  };

  const activeFaults = faults.filter(f => f.active);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Fault Injection Engine</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fault</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{faults.length}</div>
            <div className="text-dark-400">Total Faults</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-error-500">{activeFaults.length}</div>
            <div className="text-dark-400">Active</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-warning-500">
              {activeFaults.filter(f => f.severity === 'high').length}
            </div>
            <div className="text-dark-400">High Severity</div>
          </div>
        </div>

        {activeFaults.length > 0 && (
          <div className="mt-4 p-3 bg-error-500/10 border border-error-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-error-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Warning: {activeFaults.length} fault(s) currently active</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <FaultList 
          faults={faults} 
          onToggleFault={toggleFault}
          onRemoveFault={removeFault}
        />
      </div>
      
      {showAddModal && (
        <AddFaultModal
          onAdd={addFault}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};