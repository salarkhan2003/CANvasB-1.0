import React, { useState } from 'react';
import { FaultInjection } from '../../types';
import { X } from 'lucide-react';

interface AddFaultModalProps {
  onAdd: (fault: Omit<FaultInjection, 'id'>) => void;
  onClose: () => void;
}

const faultTypes = [
  { value: 'bit_error', label: 'Bit Error' },
  { value: 'bus_off', label: 'Bus Off' },
  { value: 'dominant_flip', label: 'Recessive-Dominant Flip' },
  { value: 'timeout', label: 'Timeout Scenario' }
];

const severityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const targets = [
  'Engine ECU',
  'Brake ECU',
  'Sensor Node',
  'Custom Node'
];

export const AddFaultModal: React.FC<AddFaultModalProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'bit_error' as FaultInjection['type'],
    target: 'Engine ECU',
    severity: 'medium' as FaultInjection['severity'],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description.trim()) {
      onAdd({
        ...formData,
        active: false
      });
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add Fault Scenario</h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Fault Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {faultTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Target Node
            </label>
            <select
              value={formData.target}
              onChange={(e) => handleChange('target', e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {targets.map(target => (
                <option key={target} value={target}>{target}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Severity Level
            </label>
            <select
              value={formData.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {severityLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the fault scenario..."
              rows={3}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg transition-colors"
            >
              Add Fault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};