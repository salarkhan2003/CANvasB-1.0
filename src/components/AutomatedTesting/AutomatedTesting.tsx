import React, { useState } from 'react';
import { TestScenario, TestStep, TestResult } from '../../types';
import { TestTube, Play, Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export const AutomatedTesting: React.FC = () => {
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: 'test_1',
      name: 'Engine RPM Response Test',
      description: 'Verify engine ECU responds correctly to throttle position changes',
      status: 'pending',
      steps: [
        {
          id: 'step_1',
          type: 'send_message',
          parameters: { arbitrationId: '0x123', data: '00 32 00 00 00 00 00 00', dlc: 8 },
          timeout: 1000
        },
        {
          id: 'step_2',
          type: 'wait',
          parameters: { duration: 500 }
        },
        {
          id: 'step_3',
          type: 'expect_message',
          parameters: { arbitrationId: '0x7E8', expectedData: 'contains:32' },
          timeout: 2000
        }
      ]
    },
    {
      id: 'test_2',
      name: 'Brake System Fault Injection',
      description: 'Test brake ECU behavior under fault conditions',
      status: 'pending',
      steps: [
        {
          id: 'step_1',
          type: 'inject_fault',
          parameters: { type: 'bit_error', target: 'Brake ECU', duration: 5000 }
        },
        {
          id: 'step_2',
          type: 'check_signal',
          parameters: { signal: 'absActive', expectedValue: 1 },
          timeout: 3000
        }
      ]
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runScenario = async (scenarioId: string) => {
    setIsRunning(true);
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Update scenario status
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, status: 'running' as const, results: [] } : s
    ));

    const results: TestResult[] = [];

    for (const step of scenario.steps) {
      try {
        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate step result (random pass/fail for demo)
        const passed = Math.random() > 0.2; // 80% pass rate
        
        results.push({
          stepId: step.id,
          status: passed ? 'passed' : 'failed',
          message: passed ? 'Step completed successfully' : 'Step failed - unexpected response',
          timestamp: Date.now()
        });

        if (!passed) break; // Stop on first failure
      } catch (error) {
        results.push({
          stepId: step.id,
          status: 'failed',
          message: `Step failed with error: ${error}`,
          timestamp: Date.now()
        });
        break;
      }
    }

    // Update scenario with results
    const finalStatus = results.every(r => r.status === 'passed') ? 'passed' : 'failed';
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, status: finalStatus as const, results } : s
    ));

    setIsRunning(false);
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'send_message': return 'Send Message';
      case 'wait': return 'Wait';
      case 'expect_message': return 'Expect Message';
      case 'inject_fault': return 'Inject Fault';
      case 'check_signal': return 'Check Signal';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-error-500" />;
      case 'running': return <Clock className="w-5 h-5 text-warning-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-dark-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-success-500 bg-success-500/10 border-success-500/20';
      case 'failed': return 'text-error-500 bg-error-500/10 border-error-500/20';
      case 'running': return 'text-warning-500 bg-warning-500/10 border-warning-500/20';
      default: return 'text-dark-400 bg-dark-500/10 border-dark-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Automated Test Suite</h2>
          <button
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Test</span>
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{scenarios.length}</div>
            <div className="text-dark-400">Total Tests</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-success-500">
              {scenarios.filter(s => s.status === 'passed').length}
            </div>
            <div className="text-dark-400">Passed</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-error-500">
              {scenarios.filter(s => s.status === 'failed').length}
            </div>
            <div className="text-dark-400">Failed</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-warning-500">
              {scenarios.filter(s => s.status === 'running').length}
            </div>
            <div className="text-dark-400">Running</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Test Scenarios List */}
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                    <TestTube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{scenario.name}</h3>
                    <p className="text-sm text-dark-400">{scenario.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(scenario.status)}`}>
                    {getStatusIcon(scenario.status)}
                    <span>{scenario.status.toUpperCase()}</span>
                  </div>
                  
                  <button
                    onClick={() => runScenario(scenario.id)}
                    disabled={isRunning || scenario.status === 'running'}
                    className="px-4 py-2 bg-success-600 hover:bg-success-700 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
              
              {/* Test Steps */}
              <div className="bg-dark-900 p-4 rounded-lg mb-4">
                <h4 className="text-white font-medium mb-3">Test Steps:</h4>
                <div className="space-y-2">
                  {scenario.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center text-dark-300 font-mono">
                        {index + 1}
                      </div>
                      <span className="text-dark-300">{getStepTypeLabel(step.type)}</span>
                      <span className="text-dark-500 font-mono text-xs">
                        {JSON.stringify(step.parameters).substring(0, 50)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Test Results */}
              {scenario.results && scenario.results.length > 0 && (
                <div className="bg-dark-900 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Results:</h4>
                  <div className="space-y-2">
                    {scenario.results.map((result) => (
                      <div key={result.stepId} className="flex items-center space-x-3 text-sm">
                        {getStatusIcon(result.status)}
                        <span className="text-dark-300">Step {result.stepId}:</span>
                        <span className={result.status === 'passed' ? 'text-success-400' : 'text-error-400'}>
                          {result.message}
                        </span>
                        <span className="text-dark-500 text-xs ml-auto">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Test Report Generation */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-semibold text-white">Test Reports</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-300">Generate comprehensive test reports</p>
              <p className="text-sm text-dark-400 mt-1">
                Export results in PDF, HTML, or JSON format
              </p>
            </div>
            
            <button className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};