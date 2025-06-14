import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddNodeModalProps {
  ecuTypes: readonly string[];
  onAdd: (name: string, type: any) => void;
  onClose: () => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  ecuTypes,
  onAdd,
  onClose
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(ecuTypes[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add New ECU Node</h3>
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
              Node Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter node name..."
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              ECU Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {ecuTypes.map(ecuType => (
                <option key={ecuType} value={ecuType}>{ecuType}</option>
              ))}
            </select>
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
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Add Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};