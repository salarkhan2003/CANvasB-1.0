import React, { useState, useEffect } from 'react';
import { CANMessage, DataPoint } from '../../types';
import { Brain, AlertTriangle, TrendingUp, Zap, CheckCircle } from 'lucide-react';

interface AIAnomalyDetectionProps {
  messages: CANMessage[];
  dataPoints: DataPoint[];
}

interface Anomaly {
  id: string;
  type: 'frequency' | 'data_pattern' | 'timing' | 'protocol_violation';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  relatedMessage?: CANMessage;
  confidence: number;
}

export const AIAnomalyDetection: React.FC<AIAnomalyDetectionProps> = ({ 
  messages, 
  dataPoints 
}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSettings, setAnalysisSettings] = useState({
    sensitivityLevel: 'medium' as 'low' | 'medium' | 'high',
    enableRealTime: true,
    checkFrequency: true,
    checkDataPatterns: true,
    checkTiming: true,
    checkProtocol: true
  });

  // Simulate AI anomaly detection
  useEffect(() => {
    if (!analysisSettings.enableRealTime || messages.length === 0) return;

    const detectAnomalies = () => {
      setIsAnalyzing(true);
      
      // Simulate AI processing delay
      setTimeout(() => {
        const newAnomalies: Anomaly[] = [];
        
        // Frequency analysis
        if (analysisSettings.checkFrequency) {
          const messageCounts = messages.reduce((acc, msg) => {
            acc[msg.sender] = (acc[msg.sender] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          Object.entries(messageCounts).forEach(([sender, count]) => {
            if (count > 20 && Math.random() > 0.8) { // Random anomaly detection
              newAnomalies.push({
                id: `freq_${Date.now()}_${sender}`,
                type: 'frequency',
                severity: 'medium',
                description: `Unusual high frequency detected from ${sender} (${count} messages)`,
                timestamp: Date.now(),
                confidence: 0.75 + Math.random() * 0.2
              });
            }
          });
        }
        
        // Data pattern analysis
        if (analysisSettings.checkDataPatterns && Math.random() > 0.7) {
          newAnomalies.push({
            id: `pattern_${Date.now()}`,
            type: 'data_pattern',
            severity: 'low',
            description: 'Suspicious data pattern detected in payload sequence',
            timestamp: Date.now(),
            confidence: 0.6 + Math.random() * 0.3,
            relatedMessage: messages[messages.length - 1]
          });
        }
        
        // Protocol violation check
        if (analysisSettings.checkProtocol && Math.random() > 0.85) {
          newAnomalies.push({
            id: `protocol_${Date.now()}`,
            type: 'protocol_violation',
            severity: 'high',
            description: 'Potential CAN protocol violation detected',
            timestamp: Date.now(),
            confidence: 0.9 + Math.random() * 0.1,
            relatedMessage: messages[messages.length - 1]
          });
        }
        
        setAnomalies(prev => [...prev.slice(-19), ...newAnomalies]); // Keep last 20 anomalies
        setIsAnalyzing(false);
      }, 1000 + Math.random() * 2000);
    };

    const interval = setInterval(detectAnomalies, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [messages, analysisSettings]);

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'frequency': return <TrendingUp className="w-5 h-5" />;
      case 'data_pattern': return <Brain className="w-5 h-5" />;
      case 'timing': return <Zap className="w-5 h-5" />;
      case 'protocol_violation': return <AlertTriangle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'frequency': return 'Frequency Anomaly';
      case 'data_pattern': return 'Data Pattern';
      case 'timing': return 'Timing Issue';
      case 'protocol_violation': return 'Protocol Violation';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">AI Anomaly Detection</h2>
          <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg">
            <Brain className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-white font-mono">Neural Engine Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{anomalies.length}</div>
            <div className="text-dark-400">Total Anomalies</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-error-500">
              {anomalies.filter(a => a.severity === 'high').length}
            </div>
            <div className="text-dark-400">High Severity</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-warning-500">
              {anomalies.filter(a => a.severity === 'medium').length}
            </div>
            <div className="text-dark-400">Medium Severity</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-500">
              {isAnalyzing ? 'Analyzing' : 'Ready'}
            </div>
            <div className="text-dark-400">Status</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Analysis Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-semibold text-white">Analysis Configuration</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Sensitivity Level
                </label>
                <select
                  value={analysisSettings.sensitivityLevel}
                  onChange={(e) => setAnalysisSettings(prev => ({ 
                    ...prev, 
                    sensitivityLevel: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low - Fewer false positives</option>
                  <option value="medium">Medium - Balanced detection</option>
                  <option value="high">High - Maximum sensitivity</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableRealTime"
                  checked={analysisSettings.enableRealTime}
                  onChange={(e) => setAnalysisSettings(prev => ({ 
                    ...prev, 
                    enableRealTime: e.target.checked 
                  }))}
                  className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="enableRealTime" className="text-dark-300">
                  Real-time analysis
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-dark-300 mb-3">Detection Types</div>
              
              {[
                { key: 'checkFrequency', label: 'Frequency Analysis' },
                { key: 'checkDataPatterns', label: 'Data Patterns' },
                { key: 'checkTiming', label: 'Timing Analysis' },
                { key: 'checkProtocol', label: 'Protocol Violations' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={analysisSettings[key as keyof typeof analysisSettings] as boolean}
                    onChange={(e) => setAnalysisSettings(prev => ({ 
                      ...prev, 
                      [key]: e.target.checked 
                    }))}
                    className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor={key} className="text-dark-300 text-sm">{label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly List */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Detected Anomalies</h3>
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-primary-400">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
          
          {anomalies.length === 0 ? (
            <div className="text-center text-dark-400 py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No anomalies detected</p>
              <p className="text-sm mt-1">System is operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.slice().reverse().map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)} bg-opacity-5`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                        {getAnomalyIcon(anomaly.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{getTypeLabel(anomaly.type)}</h4>
                        <p className="text-sm text-dark-400">
                          {new Date(anomaly.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </div>
                      <div className="text-xs text-dark-400 mt-1">
                        {(anomaly.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-dark-300 text-sm">{anomaly.description}</p>
                  
                  {anomaly.relatedMessage && (
                    <div className="mt-2 p-2 bg-dark-900 rounded text-xs font-mono">
                      Related: {anomaly.relatedMessage.arbitrationId} - {anomaly.relatedMessage.sender}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};