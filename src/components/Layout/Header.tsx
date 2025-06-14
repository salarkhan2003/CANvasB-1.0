import React from 'react';
import { Shield, Activity, Zap, Play, Square, RotateCcw, Cpu, AlertTriangle, Brain, Gauge } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  messageCount: number;
  activeNodes: number;
  busLoad: number;
  errorRate: number;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onStart,
  onStop,
  onClear,
  messageCount,
  activeNodes,
  busLoad,
  errorRate
}) => {
  const getBusLoadColor = (load: number) => {
    if (load > 80) return 'text-error-400';
    if (load > 60) return 'text-warning-400';
    return 'text-success-400';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate > 5) return 'text-error-400';
    if (rate > 2) return 'text-warning-400';
    return 'text-success-400';
  };

  return (
    <header className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-dark-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                CANvas Pro
              </h1>
              <p className="text-sm text-dark-400">Advanced CAN-LIN Network Analyzer & AI-Enhanced Testing Studio</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 ml-8">
            <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
              <Activity className={`w-4 h-4 ${isRunning ? 'text-success-500 animate-pulse' : 'text-dark-500'}`} />
              <span className="text-sm text-dark-300 font-medium">
                {isRunning ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-dark-300">
                <span className="font-mono text-primary-400">{messageCount.toLocaleString()}</span> messages
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
              <Cpu className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-dark-300">
                <span className="font-mono text-secondary-400">{activeNodes}</span> active nodes
              </span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
              <Gauge className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-dark-300">
                Bus Load: <span className={`font-mono ${getBusLoadColor(busLoad)}`}>{busLoad.toFixed(1)}%</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-2 bg-dark-800 rounded-lg border border-dark-600">
              <AlertTriangle className={`w-4 h-4 ${getErrorRateColor(errorRate)}`} />
              <span className="text-sm text-dark-300">
                Error Rate: <span className={`font-mono ${getErrorRateColor(errorRate)}`}>
                  {errorRate.toFixed(1)}%
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClear}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          
          {!isRunning ? (
            <button
              onClick={onStart}
              className="px-6 py-2 bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-success-600/20"
            >
              <Play className="w-4 h-4" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="px-6 py-2 bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-error-600/20"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Simulation</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg">
            <Brain className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm text-white font-medium">AI Enhanced</span>
          </div>
        </div>
      </div>
    </header>
  );
};