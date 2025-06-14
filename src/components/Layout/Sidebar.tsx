import React from 'react';
import { 
  Monitor, 
  Cpu, 
  Zap, 
  BarChart3, 
  GraduationCap, 
  Download, 
  Brain,
  ChevronRight,
  TestTube,
  Wrench,
  Radio,
  Code,
  Database,
  Car,
  Shield,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'monitor', label: 'Live Bus Monitor', icon: Monitor, color: 'text-primary-500' },
  { id: 'nodes', label: 'Virtual ECU Nodes', icon: Cpu, color: 'text-secondary-500' },
  { id: 'faults', label: 'Fault Injection', icon: Zap, color: 'text-error-500' },
  { id: 'visualization', label: 'Signal Visualization', icon: BarChart3, color: 'text-accent-500' },
  { id: 'oscilloscope', label: 'Virtual Oscilloscope', icon: Radio, color: 'text-purple-500' },
  { id: 'testing', label: 'Automated Testing', icon: TestTube, color: 'text-warning-500' },
  { id: 'scripting', label: 'Live Scripting Console', icon: Code, color: 'text-success-500' },
  { id: 'diagnostics', label: 'OBD-II & UDS Tools', icon: Wrench, color: 'text-orange-500' },
  { id: 'vehicle', label: 'Vehicle Simulator', icon: Car, color: 'text-blue-500' },
  { id: 'learning', label: 'Protocol Learning', icon: GraduationCap, color: 'text-indigo-500' },
  { id: 'export', label: 'Export & Database', icon: Database, color: 'text-teal-500' },
  { id: 'ai', label: 'AI Anomaly Detection', icon: Brain, color: 'text-pink-500' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-dark-800 to-dark-900 border-r border-dark-700 flex flex-col">
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/20 transform scale-105' 
                  : 'text-dark-300 hover:bg-dark-700 hover:text-white hover:transform hover:scale-102'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color + ' group-hover:text-white'} transition-colors`} />
              <span className="font-medium text-sm">{tab.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              {!isActive && (
                <div className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-50 ml-auto transition-opacity"></div>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-dark-700 bg-dark-900">
        <div className="text-xs text-dark-500 space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-primary-500" />
            <span className="font-medium text-dark-400">CANvas Pro v2.0.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-success-500" />
            <span>© 2025 All Rights Reserved</span>
          </div>
          <div className="text-primary-400 font-medium">Made by SalarKhan Patan</div>
          <div className="mt-2 text-accent-400">Advanced Automotive Network Analysis</div>
          <div className="mt-2 flex items-center space-x-1">
            <Brain className="w-3 h-3 text-primary-500 animate-pulse" />
            <span className="text-primary-400 text-xs">AI-Enhanced Platform</span>
          </div>
          <div className="mt-1 text-xs text-dark-600">
            Powered by Gemini AI • Production Ready
          </div>
        </div>
      </div>
    </aside>
  );
};