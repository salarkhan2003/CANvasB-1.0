import React, { useState, useRef, useEffect } from 'react';
import { Code, Play, Square, RotateCcw, Terminal, Zap } from 'lucide-react';

export const LiveScripting: React.FC = () => {
  const [script, setScript] = useState(`# CANvas Live Scripting Console
# Python-like syntax for real-time CAN/LIN operations

# Send a CAN message
can.send(id=0x123, data=[0x01, 0x02, 0x03, 0x04])

# Wait for a specific message
msg = can.wait_for(id=0x456, timeout=5000)
print(f"Received: {msg.data}")

# Inject a fault
fault.inject(type="bit_error", target="Engine ECU", duration=2000)

# Monitor signal changes
while True:
    rpm = signals.get("engine_rpm")
    if rpm > 3000:
        print(f"High RPM detected: {rpm}")
        break
    time.sleep(0.1)
`);
  const [output, setOutput] = useState<string[]>([
    'CANvas Live Scripting Console v2.0',
    'Python-like environment with CAN/LIN libraries preloaded',
    'Type your commands below or run the example script',
    ''
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [command, setCommand] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeScript = async () => {
    setIsRunning(true);
    setOutput(prev => [...prev, '>>> Executing script...', '']);
    
    // Simulate script execution with realistic output
    const lines = script.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    
    for (const line of lines) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      if (line.includes('can.send')) {
        setOutput(prev => [...prev, `>>> ${line}`, 'Message sent successfully', '']);
      } else if (line.includes('can.wait_for')) {
        setOutput(prev => [...prev, `>>> ${line}`, 'Waiting for message...', 'Received: [0x12, 0x34, 0x56, 0x78]', '']);
      } else if (line.includes('fault.inject')) {
        setOutput(prev => [...prev, `>>> ${line}`, 'Fault injection started', '']);
      } else if (line.includes('while True')) {
        setOutput(prev => [...prev, `>>> ${line}`, 'Starting monitoring loop...', 'High RPM detected: 3250', 'Loop terminated', '']);
        break;
      } else {
        setOutput(prev => [...prev, `>>> ${line}`, 'Command executed', '']);
      }
    }
    
    setOutput(prev => [...prev, 'Script execution completed', '']);
    setIsRunning(false);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;
    
    setOutput(prev => [...prev, `>>> ${command}`]);
    
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (command.includes('help')) {
      setOutput(prev => [...prev, 
        'Available modules:',
        '  can - CAN bus operations',
        '  lin - LIN bus operations', 
        '  fault - Fault injection',
        '  signals - Signal monitoring',
        '  time - Time utilities',
        ''
      ]);
    } else if (command.includes('can.')) {
      setOutput(prev => [...prev, 'CAN operation completed', '']);
    } else if (command.includes('print')) {
      const match = command.match(/print\((.*)\)/);
      if (match) {
        setOutput(prev => [...prev, match[1].replace(/['"]/g, ''), '']);
      }
    } else {
      setOutput(prev => [...prev, 'Command executed successfully', '']);
    }
    
    setCommand('');
  };

  const clearOutput = () => {
    setOutput([
      'CANvas Live Scripting Console v2.0',
      'Console cleared',
      ''
    ]);
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput(prev => [...prev, 'Execution stopped by user', '']);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Live Scripting Console</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearOutput}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
            
            {!isRunning ? (
              <button
                onClick={executeScript}
                className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Run Script</span>
              </button>
            ) : (
              <button
                onClick={stopExecution}
                className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-primary-500" />
            <span className="text-dark-300">Python-like Syntax</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-accent-500" />
            <span className="text-dark-300">Real-time Execution</span>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-secondary-500" />
            <span className="text-dark-300">Interactive REPL</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Script Editor */}
        <div className="w-1/2 border-r border-dark-700 flex flex-col">
          <div className="p-4 border-b border-dark-700 bg-dark-800">
            <h3 className="text-white font-medium">Script Editor</h3>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-full bg-dark-900 border border-dark-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Write your Python-like script here..."
              spellCheck={false}
            />
          </div>
        </div>
        
        {/* Console Output */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-dark-700 bg-dark-800">
            <h3 className="text-white font-medium">Console Output</h3>
          </div>
          
          <div 
            ref={outputRef}
            className="flex-1 p-4 bg-black font-mono text-sm text-green-400 overflow-y-auto"
          >
            {output.map((line, index) => (
              <div key={index} className={line.startsWith('>>>') ? 'text-yellow-400' : 'text-green-400'}>
                {line || '\u00A0'}
              </div>
            ))}
            {isRunning && (
              <div className="text-yellow-400 animate-pulse">
                Executing...
              </div>
            )}
          </div>
          
          {/* Command Input */}
          <div className="p-4 border-t border-dark-700 bg-dark-800">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-mono">{'>>>'}</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-white font-mono focus:outline-none"
                disabled={isRunning}
              />
              <button
                onClick={executeCommand}
                disabled={isRunning || !command.trim()}
                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};