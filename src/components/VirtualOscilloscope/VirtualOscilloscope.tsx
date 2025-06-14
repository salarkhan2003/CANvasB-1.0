import React, { useState, useEffect } from 'react';
import { CANMessage, DataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Radio, Play, Pause, Settings, Zap, TrendingUp, Activity, Gauge, Signal, Cpu } from 'lucide-react';

interface VirtualOscilloscopeProps {
  messages: CANMessage[];
  dataPoints: DataPoint[];
}

// Mock oscilloscope data generator
const generateMockOscilloscopeData = (signalType: string, samples: number = 1000) => {
  const data = [];
  const baseTime = Date.now();
  
  for (let i = 0; i < samples; i++) {
    const time = i * 0.1; // 0.1ms intervals
    let voltage = 0;
    
    switch (signalType) {
      case 'can_high':
        // CAN High signal (2.5V to 3.5V)
        voltage = 2.5 + Math.sin(time * 0.1) * 0.5 + (Math.random() - 0.5) * 0.1;
        if (i % 100 < 50) voltage += 1; // Digital transitions
        break;
      case 'can_low':
        // CAN Low signal (1.5V to 2.5V)
        voltage = 2.5 - Math.sin(time * 0.1) * 0.5 + (Math.random() - 0.5) * 0.1;
        if (i % 100 < 50) voltage -= 1; // Digital transitions
        break;
      case 'can_diff':
        // CAN Differential signal
        voltage = Math.sin(time * 0.2) * 2 + (Math.random() - 0.5) * 0.2;
        if (i % 80 < 40) voltage = voltage > 0 ? 2 : -2; // Digital levels
        break;
      case 'lin_bus':
        // LIN Bus signal (0V to 12V)
        voltage = 12;
        if (i % 200 < 20) voltage = 0; // Sync break
        else if (i % 200 < 40) voltage = 6 + Math.sin(time * 0.5) * 6; // Sync field
        else if (i % 200 < 100) voltage = Math.random() > 0.5 ? 12 : 0; // Data bits
        break;
      case 'power_supply':
        // 12V power supply with ripple
        voltage = 12 + Math.sin(time * 0.05) * 0.2 + (Math.random() - 0.5) * 0.1;
        break;
      case 'sensor_analog':
        // Analog sensor signal
        voltage = 2.5 + Math.sin(time * 0.02) * 2 + Math.cos(time * 0.03) * 0.5;
        break;
      default:
        voltage = Math.sin(time * 0.1) * 3 + (Math.random() - 0.5) * 0.2;
    }
    
    data.push({
      time: time,
      timestamp: baseTime + i,
      voltage: Math.round(voltage * 1000) / 1000,
      frequency: Math.abs(Math.sin(time * 0.1)) * 1000 + 500
    });
  }
  
  return data;
};

export const VirtualOscilloscope: React.FC<VirtualOscilloscopeProps> = ({ 
  messages, 
  dataPoints 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState('can_diff');
  const [triggerSettings, setTriggerSettings] = useState({
    enabled: true,
    signal: 'voltage',
    condition: 'rising_edge',
    threshold: 2.0,
    holdoff: 100
  });
  const [timebase, setTimebase] = useState(1000); // ms per division
  const [amplitude, setAmplitude] = useState(5); // volts per division
  const [capturedData, setCapturedData] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'line' | 'area' | 'dots'>('line');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurements, setMeasurements] = useState({
    vpp: 0, // Peak-to-peak voltage
    vrms: 0, // RMS voltage
    frequency: 0,
    period: 0,
    dutyCycle: 0
  });

  const signalTypes = [
    { value: 'can_high', label: 'CAN High', icon: Signal, color: '#0ea5e9' },
    { value: 'can_low', label: 'CAN Low', icon: Signal, color: '#10b981' },
    { value: 'can_diff', label: 'CAN Differential', icon: Activity, color: '#f59e0b' },
    { value: 'lin_bus', label: 'LIN Bus', icon: Radio, color: '#ef4444' },
    { value: 'power_supply', label: '12V Power Supply', icon: Zap, color: '#8b5cf6' },
    { value: 'sensor_analog', label: 'Analog Sensor', icon: Gauge, color: '#06b6d4' }
  ];

  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        const newData = generateMockOscilloscopeData(selectedSignal, 500);
        
        // Apply trigger logic
        if (triggerSettings.enabled) {
          const triggerPoint = findTriggerPoint(newData);
          if (triggerPoint !== -1) {
            const windowStart = Math.max(0, triggerPoint - 250);
            const windowEnd = Math.min(newData.length, triggerPoint + 250);
            setCapturedData(newData.slice(windowStart, windowEnd));
          }
        } else {
          setCapturedData(newData);
        }
        
        // Calculate measurements
        if (measurementMode && newData.length > 0) {
          calculateMeasurements(newData);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isCapturing, selectedSignal, triggerSettings, measurementMode]);

  const findTriggerPoint = (data: any[]): number => {
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1].voltage;
      const curr = data[i].voltage;
      
      switch (triggerSettings.condition) {
        case 'rising_edge':
          if (prev < triggerSettings.threshold && curr >= triggerSettings.threshold) {
            return i;
          }
          break;
        case 'falling_edge':
          if (prev > triggerSettings.threshold && curr <= triggerSettings.threshold) {
            return i;
          }
          break;
        case 'level':
          if (Math.abs(curr - triggerSettings.threshold) < 0.1) {
            return i;
          }
          break;
      }
    }
    return -1;
  };

  const calculateMeasurements = (data: any[]) => {
    if (data.length === 0) return;
    
    const voltages = data.map(d => d.voltage);
    const max = Math.max(...voltages);
    const min = Math.min(...voltages);
    const vpp = max - min;
    
    // Calculate RMS
    const sumSquares = voltages.reduce((sum, v) => sum + v * v, 0);
    const vrms = Math.sqrt(sumSquares / voltages.length);
    
    // Estimate frequency (simplified)
    let crossings = 0;
    const threshold = (max + min) / 2;
    for (let i = 1; i < voltages.length; i++) {
      if ((voltages[i-1] < threshold && voltages[i] >= threshold) ||
          (voltages[i-1] > threshold && voltages[i] <= threshold)) {
        crossings++;
      }
    }
    const frequency = crossings / 2 / (data.length * 0.0001); // Approximate frequency
    const period = frequency > 0 ? 1 / frequency : 0;
    
    // Calculate duty cycle (simplified)
    const highSamples = voltages.filter(v => v > threshold).length;
    const dutyCycle = (highSamples / voltages.length) * 100;
    
    setMeasurements({
      vpp: Math.round(vpp * 1000) / 1000,
      vrms: Math.round(vrms * 1000) / 1000,
      frequency: Math.round(frequency * 100) / 100,
      period: Math.round(period * 1000000) / 1000, // in microseconds
      dutyCycle: Math.round(dutyCycle * 10) / 10
    });
  };

  const formatTime = (time: number) => {
    return (time / 1000).toFixed(3);
  };

  const selectedSignalInfo = signalTypes.find(s => s.value === selectedSignal);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Virtual Oscilloscope</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMeasurementMode(!measurementMode)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                measurementMode 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Measurements
            </button>
            <button
              onClick={() => setIsCapturing(!isCapturing)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isCapturing 
                  ? 'bg-error-600 hover:bg-error-700 text-white' 
                  : 'bg-success-600 hover:bg-success-700 text-white'
              }`}
            >
              {isCapturing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isCapturing ? 'Stop' : 'Start'} Capture</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{capturedData.length}</div>
            <div className="text-dark-400">Samples</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-500">{timebase}ms</div>
            <div className="text-dark-400">Time/Div</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-secondary-500">{amplitude}V</div>
            <div className="text-dark-400">Volt/Div</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className={`text-2xl font-bold ${isCapturing ? 'text-success-500' : 'text-warning-500'}`}>
              {isCapturing ? 'TRIG' : 'STOP'}
            </div>
            <div className="text-dark-400">Status</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-accent-500">
              {measurements.frequency.toFixed(1)}Hz
            </div>
            <div className="text-dark-400">Frequency</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Signal Selection */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Signal Selection</h3>
          <div className="grid grid-cols-3 gap-3">
            {signalTypes.map((signal) => {
              const Icon = signal.icon;
              return (
                <button
                  key={signal.value}
                  onClick={() => setSelectedSignal(signal.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedSignal === signal.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-600 bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" style={{ color: signal.color }} />
                    <span className="text-sm text-white">{signal.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Oscilloscope Display */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-white">Waveform Display</h3>
              {selectedSignalInfo && (
                <div className="flex items-center space-x-2 ml-4">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: selectedSignalInfo.color }}
                  ></div>
                  <span className="text-sm text-dark-300">{selectedSignalInfo.label}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as any)}
                className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="dots">Dots</option>
              </select>
            </div>
          </div>
          
          {capturedData.length > 0 ? (
            <div className="bg-black p-4 rounded-lg border-2 border-dark-600 relative">
              {/* Grid overlay */}
              <div className="absolute inset-4 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                {displayMode === 'area' ? (
                  <AreaChart data={capturedData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
                    <XAxis 
                      dataKey="time"
                      tickFormatter={formatTime}
                      stroke="#9ca3af"
                      fontSize={12}
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      labelFormatter={(value) => `Time: ${formatTime(value as number)}s`}
                      formatter={(value: any) => [value.toFixed(3) + 'V', 'Voltage']}
                    />
                    <Area
                      type="monotone"
                      dataKey="voltage"
                      stroke={selectedSignalInfo?.color || '#0ea5e9'}
                      fill={selectedSignalInfo?.color || '#0ea5e9'}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={capturedData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
                    <XAxis 
                      dataKey="time"
                      tickFormatter={formatTime}
                      stroke="#9ca3af"
                      fontSize={12}
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      labelFormatter={(value) => `Time: ${formatTime(value as number)}s`}
                      formatter={(value: any) => [value.toFixed(3) + 'V', 'Voltage']}
                    />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke={selectedSignalInfo?.color || '#0ea5e9'}
                      strokeWidth={2}
                      dot={displayMode === 'dots'}
                      connectNulls={false}
                    />
                    {/* Trigger line */}
                    {triggerSettings.enabled && (
                      <Line
                        type="monotone"
                        dataKey={() => triggerSettings.threshold}
                        stroke="#ef4444"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-black p-8 rounded-lg border-2 border-dark-600 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-dark-500" />
              <p className="text-dark-400">No signal captured</p>
              <p className="text-sm text-dark-500 mt-1">Start capture to see waveforms</p>
            </div>
          )}
        </div>

        {/* Measurements Panel */}
        {measurementMode && (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-semibold text-white">Signal Measurements</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-dark-900 p-3 rounded-lg text-center">
                <div className="text-lg font-mono text-accent-400">{measurements.vpp}V</div>
                <div className="text-xs text-dark-400">Peak-to-Peak</div>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg text-center">
                <div className="text-lg font-mono text-primary-400">{measurements.vrms}V</div>
                <div className="text-xs text-dark-400">RMS Voltage</div>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg text-center">
                <div className="text-lg font-mono text-success-400">{measurements.frequency}Hz</div>
                <div className="text-xs text-dark-400">Frequency</div>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg text-center">
                <div className="text-lg font-mono text-warning-400">{measurements.period}μs</div>
                <div className="text-xs text-dark-400">Period</div>
              </div>
              <div className="bg-dark-900 p-3 rounded-lg text-center">
                <div className="text-lg font-mono text-secondary-400">{measurements.dutyCycle}%</div>
                <div className="text-xs text-dark-400">Duty Cycle</div>
              </div>
            </div>
          </div>
        )}

        {/* Trigger Settings */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-semibold text-white">Trigger Settings</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Trigger Condition
                </label>
                <select
                  value={triggerSettings.condition}
                  onChange={(e) => setTriggerSettings(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="rising_edge">Rising Edge</option>
                  <option value="falling_edge">Falling Edge</option>
                  <option value="level">Level</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Threshold Voltage
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={triggerSettings.threshold}
                  onChange={(e) => setTriggerSettings(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Time/Division (ms)
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={timebase}
                  onChange={(e) => setTimebase(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-sm text-dark-400 mt-1">{timebase}ms</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Voltage/Division (V)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={amplitude}
                  onChange={(e) => setAmplitude(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-sm text-dark-400 mt-1">{amplitude}V</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="triggerEnabled"
                  checked={triggerSettings.enabled}
                  onChange={(e) => setTriggerSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="triggerEnabled" className="text-dark-300">
                  Enable Trigger
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};