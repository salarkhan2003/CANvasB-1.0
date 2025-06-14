import React, { useState } from 'react';
import { OBDCommand, UDSService } from '../../types';
import { Wrench, Car, Zap, AlertTriangle, CheckCircle, Send } from 'lucide-react';

export const DiagnosticsTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'obd' | 'uds'>('obd');
  const [selectedPID, setSelectedPID] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [response, setResponse] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const obdCommands: OBDCommand[] = [
    { pid: '01 00', name: 'Supported PIDs', description: 'PIDs supported [01-20]', formula: 'Bit encoded', unit: '' },
    { pid: '01 01', name: 'Monitor Status', description: 'Monitor status since DTCs cleared', formula: 'Bit encoded', unit: '' },
    { pid: '01 04', name: 'Engine Load', description: 'Calculated engine load value', formula: 'A*100/255', unit: '%' },
    { pid: '01 05', name: 'Coolant Temp', description: 'Engine coolant temperature', formula: 'A-40', unit: '°C' },
    { pid: '01 06', name: 'Short Fuel Trim', description: 'Short term fuel trim—Bank 1', formula: '(A-128)*100/128', unit: '%' },
    { pid: '01 0C', name: 'Engine RPM', description: 'Engine RPM', formula: '((A*256)+B)/4', unit: 'rpm' },
    { pid: '01 0D', name: 'Vehicle Speed', description: 'Vehicle speed', formula: 'A', unit: 'km/h' },
    { pid: '01 0F', name: 'Intake Air Temp', description: 'Intake air temperature', formula: 'A-40', unit: '°C' },
    { pid: '01 11', name: 'Throttle Position', description: 'Throttle position', formula: 'A*100/255', unit: '%' },
    { pid: '01 1F', name: 'Runtime', description: 'Run time since engine start', formula: '(A*256)+B', unit: 'seconds' }
  ];

  const udsServices: UDSService[] = [
    {
      id: '10',
      name: 'Diagnostic Session Control',
      description: 'Used to enable different diagnostic sessions',
      subfunctions: [
        { id: '01', name: 'Default Session', description: 'Default diagnostic session' },
        { id: '02', name: 'Programming Session', description: 'Programming diagnostic session' },
        { id: '03', name: 'Extended Session', description: 'Extended diagnostic session' }
      ]
    },
    {
      id: '11',
      name: 'ECU Reset',
      description: 'Used to reset the ECU',
      subfunctions: [
        { id: '01', name: 'Hard Reset', description: 'Hard reset' },
        { id: '02', name: 'Key Off On Reset', description: 'Key off on reset' },
        { id: '03', name: 'Soft Reset', description: 'Soft reset' }
      ]
    },
    {
      id: '22',
      name: 'Read Data By Identifier',
      description: 'Read data by identifier',
      subfunctions: [
        { id: 'F186', name: 'Active Diagnostic Session', description: 'Current diagnostic session' },
        { id: 'F190', name: 'VIN', description: 'Vehicle identification number' },
        { id: 'F1A0', name: 'Boot Software ID', description: 'Boot software identification' }
      ]
    },
    {
      id: '27',
      name: 'Security Access',
      description: 'Security access control',
      subfunctions: [
        { id: '01', name: 'Request Seed', description: 'Request security seed' },
        { id: '02', name: 'Send Key', description: 'Send security key' }
      ]
    }
  ];

  const sendOBDCommand = async () => {
    if (!selectedPID) return;
    
    setResponse('Sending command...');
    
    // Simulate OBD response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const command = obdCommands.find(cmd => cmd.pid === selectedPID);
    if (command) {
      // Generate mock response based on PID
      let mockResponse = '';
      switch (selectedPID) {
        case '01 0C': // RPM
          mockResponse = '41 0C 1A F8'; // ~2750 RPM
          break;
        case '01 0D': // Speed
          mockResponse = '41 0D 4B'; // 75 km/h
          break;
        case '01 05': // Coolant temp
          mockResponse = '41 05 7D'; // 85°C
          break;
        case '01 11': // Throttle position
          mockResponse = '41 11 73'; // ~45%
          break;
        default:
          mockResponse = '41 ' + selectedPID.split(' ')[1] + ' 00 00';
      }
      setResponse(`Request: ${selectedPID}\nResponse: ${mockResponse}\nStatus: Success`);
    }
  };

  const sendUDSCommand = async () => {
    if (!selectedService) return;
    
    setResponse('Sending UDS command...');
    
    // Simulate UDS response
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const service = udsServices.find(svc => svc.id === selectedService);
    if (service) {
      let mockResponse = '';
      switch (selectedService) {
        case '10':
          mockResponse = '50 01'; // Positive response for default session
          break;
        case '22':
          mockResponse = '62 F1 90 57 44 42 5A 5A 5A 31 32 33 34 35 36 37 38 39'; // Mock VIN
          break;
        case '27':
          mockResponse = '67 01 12 34 56 78'; // Mock security seed
          break;
        default:
          mockResponse = `${(parseInt(selectedService, 16) + 0x40).toString(16).toUpperCase()} 00`;
      }
      setResponse(`Request: ${selectedService}\nResponse: ${mockResponse}\nStatus: Success`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">OBD-II & UDS Diagnostic Tools</h2>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-success-500/10 text-success-400' : 'bg-error-500/10 text-error-400'
            }`}>
              {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => setIsConnected(!isConnected)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isConnected 
                  ? 'bg-error-600 hover:bg-error-700 text-white' 
                  : 'bg-success-600 hover:bg-success-700 text-white'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('obd')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'obd' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            OBD-II Scanner
          </button>
          <button
            onClick={() => setActiveTab('uds')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'uds' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            UDS Tester
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {activeTab === 'obd' ? (
          <>
            {/* OBD-II Scanner */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-white">OBD-II Parameter Scanner</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Select PID
                  </label>
                  <select
                    value={selectedPID}
                    onChange={(e) => setSelectedPID(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a PID...</option>
                    {obdCommands.map(cmd => (
                      <option key={cmd.pid} value={cmd.pid}>
                        {cmd.pid} - {cmd.name}
                      </option>
                    ))}
                  </select>
                  
                  {selectedPID && (
                    <div className="mt-3 p-3 bg-dark-900 rounded-lg">
                      {(() => {
                        const cmd = obdCommands.find(c => c.pid === selectedPID);
                        return cmd ? (
                          <div className="text-sm">
                            <div className="text-dark-300">{cmd.description}</div>
                            <div className="text-dark-400 mt-1">Formula: {cmd.formula}</div>
                            <div className="text-dark-400">Unit: {cmd.unit || 'N/A'}</div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                
                <div>
                  <button
                    onClick={sendOBDCommand}
                    disabled={!isConnected || !selectedPID}
                    className="w-full px-4 py-2 bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send OBD Command</span>
                  </button>
                </div>
              </div>
            </div>

            {/* OBD Commands Reference */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Available OBD-II PIDs</h3>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {obdCommands.map(cmd => (
                  <div key={cmd.pid} className="flex items-center justify-between p-2 bg-dark-900 rounded">
                    <div>
                      <span className="font-mono text-primary-400">{cmd.pid}</span>
                      <span className="ml-3 text-white">{cmd.name}</span>
                    </div>
                    <span className="text-dark-400 text-sm">{cmd.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* UDS Tester */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-semibold text-white">UDS Service Tester</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Select UDS Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a service...</option>
                    {udsServices.map(svc => (
                      <option key={svc.id} value={svc.id}>
                        0x{svc.id} - {svc.name}
                      </option>
                    ))}
                  </select>
                  
                  {selectedService && (
                    <div className="mt-3 p-3 bg-dark-900 rounded-lg">
                      {(() => {
                        const svc = udsServices.find(s => s.id === selectedService);
                        return svc ? (
                          <div className="text-sm">
                            <div className="text-dark-300">{svc.description}</div>
                            {svc.subfunctions && (
                              <div className="mt-2">
                                <div className="text-dark-400 text-xs mb-1">Subfunctions:</div>
                                {svc.subfunctions.slice(0, 3).map(sub => (
                                  <div key={sub.id} className="text-dark-400 text-xs">
                                    • {sub.id}: {sub.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                
                <div>
                  <button
                    onClick={sendUDSCommand}
                    disabled={!isConnected || !selectedService}
                    className="w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Send UDS Command</span>
                  </button>
                </div>
              </div>
            </div>

            {/* UDS Services Reference */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">UDS Services Reference</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {udsServices.map(svc => (
                  <div key={svc.id} className="p-3 bg-dark-900 rounded">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-accent-400">0x{svc.id}</span>
                      <span className="text-white font-medium">{svc.name}</span>
                    </div>
                    <div className="text-dark-400 text-sm">{svc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Response</h3>
            <div className="bg-black p-4 rounded-lg font-mono text-sm">
              <pre className="text-green-400 whitespace-pre-wrap">{response}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};