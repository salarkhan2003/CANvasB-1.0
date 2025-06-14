import React, { useState } from 'react';
import { CANMessage } from '../../types';
import { Download, FileText, Database, Settings } from 'lucide-react';

interface ExportLoggingProps {
  messages: CANMessage[];
}

export const ExportLogging: React.FC<ExportLoggingProps> = ({ messages }) => {
  const [exportFormat, setExportFormat] = useState<'log' | 'blf' | 'asc' | 'csv'>('log');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeTimestamp: true,
    includeData: true,
    filterByType: 'all' as 'all' | 'CAN' | 'LIN'
  });

  const exportFormats = [
    { value: 'log', label: 'Standard Log (.log)', description: 'Human-readable log format' },
    { value: 'blf', label: 'Binary Log (.blf)', description: 'Vector Binary Logging Format' },
    { value: 'asc', label: 'ASCII Log (.asc)', description: 'CANalyzer ASCII format' },
    { value: 'csv', label: 'CSV Export (.csv)', description: 'Comma-separated values' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Filter messages based on settings
    const filteredMessages = messages.filter(msg => 
      exportSettings.filterByType === 'all' || msg.type === exportSettings.filterByType
    );

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let content = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `canvas_export_${timestamp}.${exportFormat}`;

    switch (exportFormat) {
      case 'log':
        content = generateLogFormat(filteredMessages);
        break;
      case 'asc':
        content = generateASCFormat(filteredMessages);
        break;
      case 'csv':
        content = generateCSVFormat(filteredMessages);
        break;
      case 'blf':
        content = 'Binary format - This would be actual binary data in a real implementation';
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const generateLogFormat = (msgs: CANMessage[]) => {
    return msgs.map(msg => {
      const timestamp = exportSettings.includeTimestamp 
        ? new Date(msg.timestamp).toISOString() + ' ' 
        : '';
      const data = exportSettings.includeData ? ` Data: ${msg.data}` : '';
      return `${timestamp}${msg.type} ${msg.arbitrationId} [${msg.dlc}]${data} - ${msg.sender}`;
    }).join('\n');
  };

  const generateASCFormat = (msgs: CANMessage[]) => {
    const header = 'date Mon Jan 01 00:00:00.000 2024\nbase hex  timestamps absolute\ninternal events logged\n';
    const content = msgs.map((msg, index) => {
      const time = (msg.timestamp / 1000).toFixed(3);
      const id = parseInt(msg.arbitrationId.replace('0x', ''), 16);
      return `${time} 1 ${id.toString(16).toUpperCase()}x Rx d ${msg.dlc} ${msg.data.match(/.{1,2}/g)?.join(' ') || ''}`;
    }).join('\n');
    return header + content;
  };

  const generateCSVFormat = (msgs: CANMessage[]) => {
    const headers = ['Timestamp', 'Type', 'Arbitration ID', 'DLC', 'Data', 'Sender', 'Priority'].join(',');
    const rows = msgs.map(msg => [
      exportSettings.includeTimestamp ? new Date(msg.timestamp).toISOString() : '',
      msg.type,
      msg.arbitrationId,
      msg.dlc,
      exportSettings.includeData ? msg.data : '',
      msg.sender,
      msg.priority
    ].join(',')).join('\n');
    return headers + '\n' + rows;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <h2 className="text-xl font-semibold text-white mb-4">Export & Logging</h2>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{messages.length}</div>
            <div className="text-dark-400">Total Messages</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-500">
              {messages.filter(m => m.type === 'CAN').length}
            </div>
            <div className="text-dark-400">CAN Messages</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-secondary-500">
              {messages.filter(m => m.type === 'LIN').length}
            </div>
            <div className="text-dark-400">LIN Messages</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-success-500">Live</div>
            <div className="text-dark-400">Capture</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Export Format Selection */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Export Format</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value as any)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  exportFormat === format.value
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-dark-700 border-dark-600 text-dark-300 hover:bg-dark-600'
                }`}
              >
                <div className="font-medium">{format.label}</div>
                <div className="text-sm opacity-75 mt-1">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-semibold text-white">Export Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeTimestamp"
                checked={exportSettings.includeTimestamp}
                onChange={(e) => setExportSettings(prev => ({ ...prev, includeTimestamp: e.target.checked }))}
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="includeTimestamp" className="text-dark-300">Include timestamps</label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeData"
                checked={exportSettings.includeData}
                onChange={(e) => setExportSettings(prev => ({ ...prev, includeData: e.target.checked }))}
                className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="includeData" className="text-dark-300">Include data payload</label>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-dark-300">Filter by type:</label>
              <select
                value={exportSettings.filterByType}
                onChange={(e) => setExportSettings(prev => ({ ...prev, filterByType: e.target.value as any }))}
                className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All messages</option>
                <option value="CAN">CAN only</option>
                <option value="LIN">LIN only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Action */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Export</h3>
              <p className="text-dark-400">
                Export {messages.filter(m => exportSettings.filterByType === 'all' || m.type === exportSettings.filterByType).length} messages 
                in {exportFormats.find(f => f.value === exportFormat)?.label} format
              </p>
            </div>
            
            <button
              onClick={handleExport}
              disabled={isExporting || messages.length === 0}
              className="px-6 py-3 bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Capture Info */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-secondary-500" />
            <h3 className="text-lg font-semibold text-white">Real-time Capture</h3>
          </div>
          
          <div className="space-y-3 text-dark-300">
            <div className="flex items-center justify-between">
              <span>Capture Status:</span>
              <span className="text-success-500 flex items-center space-x-1">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Buffer Size:</span>
              <span className="font-mono">{messages.length}/1000</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Capture Rate:</span>
              <span className="font-mono">~2.5 msg/sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};