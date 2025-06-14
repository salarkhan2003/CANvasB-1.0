import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { BusMonitor } from './components/BusMonitor/BusMonitor';
import { NodeDashboard } from './components/NodeDashboard/NodeDashboard';
import { FaultInjection } from './components/FaultInjection/FaultInjection';
import { DataVisualization } from './components/DataVisualization/DataVisualization';
import { VirtualOscilloscope } from './components/VirtualOscilloscope/VirtualOscilloscope';
import { AutomatedTesting } from './components/AutomatedTesting/AutomatedTesting';
import { LiveScripting } from './components/LiveScripting/LiveScripting';
import { DiagnosticsTools } from './components/DiagnosticsTools/DiagnosticsTools';
import { VehicleSimulator } from './components/VehicleSimulator/VehicleSimulator';
import { ProtocolLearning } from './components/ProtocolLearning/ProtocolLearning';
import { ExportLogging } from './components/ExportLogging/ExportLogging';
import { AIAnomalyDetection } from './components/AIAnomalyDetection/AIAnomalyDetection';
import { AIAssistant } from './components/AI/AIAssistant';
import { useAdvancedCANSimulator } from './hooks/useAdvancedCANSimulator';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  
  const {
    messages,
    nodes,
    dataPoints,
    faults,
    isRunning,
    busLoad,
    errorRate,
    startSimulation,
    stopSimulation,
    addNode,
    updateNodeStatus,
    addFault,
    toggleFault,
    clearMessages,
    ecuTypes,
    protocols
  } = useAdvancedCANSimulator();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'monitor':
        return <BusMonitor messages={messages} />;
      case 'nodes':
        return (
          <NodeDashboard
            nodes={nodes}
            onAddNode={addNode}
            onUpdateNodeStatus={updateNodeStatus}
            ecuTypes={ecuTypes}
          />
        );
      case 'faults':
        return <FaultInjection />;
      case 'visualization':
        return <DataVisualization dataPoints={dataPoints} />;
      case 'oscilloscope':
        return <VirtualOscilloscope messages={messages} dataPoints={dataPoints} />;
      case 'testing':
        return <AutomatedTesting />;
      case 'scripting':
        return <LiveScripting />;
      case 'diagnostics':
        return <DiagnosticsTools />;
      case 'vehicle':
        return <VehicleSimulator />;
      case 'learning':
        return <ProtocolLearning />;
      case 'export':
        return <ExportLogging messages={messages} />;
      case 'ai':
        return <AIAnomalyDetection messages={messages} dataPoints={dataPoints} />;
      default:
        return <BusMonitor messages={messages} />;
    }
  };

  const getAIContext = () => {
    const contextMap = {
      monitor: 'monitor',
      nodes: 'nodes',
      faults: 'faults',
      visualization: 'visualization',
      oscilloscope: 'oscilloscope',
      testing: 'testing',
      scripting: 'scripting',
      diagnostics: 'diagnostics',
      vehicle: 'vehicle',
      learning: 'learning',
      export: 'export',
      ai: 'ai'
    };
    return contextMap[activeTab] || 'dashboard';
  };

  const getAITitle = () => {
    const titleMap = {
      monitor: 'Network Monitor AI',
      nodes: 'Node Management AI',
      faults: 'Fault Testing AI',
      visualization: 'Data Analysis AI',
      oscilloscope: 'Signal Analysis AI',
      testing: 'Test Automation AI',
      scripting: 'Scripting Assistant AI',
      diagnostics: 'Diagnostics AI',
      vehicle: 'Vehicle Simulation AI',
      learning: 'Learning Tutor AI',
      export: 'Data Export AI',
      ai: 'AI Anomaly Expert'
    };
    return titleMap[activeTab] || 'CANvas AI Assistant';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 text-white flex flex-col overflow-hidden">
      <Header
        isRunning={isRunning}
        onStart={startSimulation}
        onStop={stopSimulation}
        onClear={clearMessages}
        messageCount={messages.length}
        activeNodes={nodes.filter(n => n.status === 'active').length}
        busLoad={busLoad}
        errorRate={errorRate}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-dark-950 to-dark-900">
          {renderActiveTab()}
        </main>
      </div>

      {/* Context-Aware AI Assistant */}
      <AIAssistant 
        context={getAIContext()}
        title={getAITitle()}
      />
    </div>
  );
}

export default App;