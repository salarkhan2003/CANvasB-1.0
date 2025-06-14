import React, { useState, useEffect } from 'react';
import { Car, Gauge, Thermometer, Fuel, Battery, Settings } from 'lucide-react';

export const VehicleSimulator: React.FC = () => {
  const [vehicleState, setVehicleState] = useState({
    speed: 75,
    rpm: 2500,
    engineTemp: 85,
    fuelLevel: 68,
    batteryVoltage: 12.4,
    throttlePosition: 45,
    brakePosition: 0,
    steeringAngle: 0,
    gearPosition: 4,
    engineLoad: 35
  });

  const [isRunning, setIsRunning] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'manual' | 'scenario'>('manual');
  const [selectedScenario, setSelectedScenario] = useState('city_driving');

  const scenarios = [
    { id: 'city_driving', name: 'City Driving', description: 'Stop-and-go traffic simulation' },
    { id: 'highway_cruise', name: 'Highway Cruise', description: 'Steady highway driving' },
    { id: 'acceleration_test', name: 'Acceleration Test', description: 'Full throttle acceleration' },
    { id: 'cold_start', name: 'Cold Start', description: 'Engine cold start sequence' },
    { id: 'emergency_brake', name: 'Emergency Brake', description: 'Emergency braking scenario' }
  ];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (simulationMode === 'scenario') {
        updateScenarioState();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simulationMode, selectedScenario]);

  const updateScenarioState = () => {
    setVehicleState(prev => {
      const newState = { ...prev };
      
      switch (selectedScenario) {
        case 'city_driving':
          // Simulate stop-and-go traffic
          newState.speed = Math.max(0, prev.speed + (Math.random() - 0.5) * 10);
          newState.rpm = 800 + (newState.speed * 30);
          newState.throttlePosition = newState.speed > 30 ? 20 + Math.random() * 30 : Math.random() * 60;
          break;
          
        case 'highway_cruise':
          // Steady highway driving
          newState.speed = 120 + (Math.random() - 0.5) * 5;
          newState.rpm = 2200 + (Math.random() - 0.5) * 200;
          newState.throttlePosition = 25 + (Math.random() - 0.5) * 10;
          break;
          
        case 'acceleration_test':
          // Full throttle acceleration
          if (newState.speed < 200) {
            newState.speed = Math.min(200, prev.speed + 2);
            newState.rpm = Math.min(6500, 2000 + (newState.speed * 25));
            newState.throttlePosition = 95 + Math.random() * 5;
          }
          break;
          
        case 'cold_start':
          // Cold start sequence
          newState.engineTemp = Math.min(90, prev.engineTemp + 0.5);
          newState.rpm = newState.engineTemp < 60 ? 1200 + Math.random() * 300 : 800 + Math.random() * 100;
          newState.speed = 0;
          break;
          
        case 'emergency_brake':
          // Emergency braking
          newState.speed = Math.max(0, prev.speed - 5);
          newState.brakePosition = newState.speed > 0 ? 80 + Math.random() * 20 : 0;
          newState.throttlePosition = 0;
          break;
      }
      
      // Update dependent parameters
      newState.engineLoad = Math.min(100, (newState.throttlePosition * 0.8) + (newState.rpm / 100));
      newState.fuelLevel = Math.max(0, prev.fuelLevel - 0.001);
      newState.batteryVoltage = 12.0 + (Math.random() * 0.8);
      
      return newState;
    });
  };

  const handleManualChange = (parameter: string, value: number) => {
    setVehicleState(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const resetVehicle = () => {
    setVehicleState({
      speed: 0,
      rpm: 800,
      engineTemp: 20,
      fuelLevel: 100,
      batteryVoltage: 12.6,
      throttlePosition: 0,
      brakePosition: 0,
      steeringAngle: 0,
      gearPosition: 1,
      engineLoad: 0
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Vehicle Simulator</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={resetVehicle}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRunning 
                  ? 'bg-error-600 hover:bg-error-700 text-white' 
                  : 'bg-success-600 hover:bg-success-700 text-white'
              }`}
            >
              {isRunning ? 'Stop' : 'Start'} Simulation
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSimulationMode('manual')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              simulationMode === 'manual' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            Manual Control
          </button>
          <button
            onClick={() => setSimulationMode('scenario')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              simulationMode === 'scenario' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            Scenario Mode
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Vehicle Dashboard */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Car className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Vehicle Dashboard</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {/* Speed */}
            <div className="bg-dark-900 p-4 rounded-lg text-center">
              <Gauge className="w-8 h-8 mx-auto mb-2 text-primary-400" />
              <div className="text-2xl font-bold text-white">{vehicleState.speed.toFixed(0)}</div>
              <div className="text-sm text-dark-400">km/h</div>
            </div>
            
            {/* RPM */}
            <div className="bg-dark-900 p-4 rounded-lg text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">RPM</span>
              </div>
              <div className="text-2xl font-bold text-white">{vehicleState.rpm.toFixed(0)}</div>
              <div className="text-sm text-dark-400">rpm</div>
            </div>
            
            {/* Engine Temp */}
            <div className="bg-dark-900 p-4 rounded-lg text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2 text-warning-400" />
              <div className="text-2xl font-bold text-white">{vehicleState.engineTemp.toFixed(0)}</div>
              <div className="text-sm text-dark-400">°C</div>
            </div>
            
            {/* Fuel Level */}
            <div className="bg-dark-900 p-4 rounded-lg text-center">
              <Fuel className="w-8 h-8 mx-auto mb-2 text-accent-400" />
              <div className="text-2xl font-bold text-white">{vehicleState.fuelLevel.toFixed(0)}</div>
              <div className="text-sm text-dark-400">%</div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        {simulationMode === 'manual' ? (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-semibold text-white">Manual Controls</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Throttle Position: {vehicleState.throttlePosition.toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vehicleState.throttlePosition}
                    onChange={(e) => handleManualChange('throttlePosition', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Brake Position: {vehicleState.brakePosition.toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vehicleState.brakePosition}
                    onChange={(e) => handleManualChange('brakePosition', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Steering Angle: {vehicleState.steeringAngle.toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="-540"
                    max="540"
                    value={vehicleState.steeringAngle}
                    onChange={(e) => handleManualChange('steeringAngle', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Vehicle Speed: {vehicleState.speed.toFixed(0)} km/h
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    value={vehicleState.speed}
                    onChange={(e) => handleManualChange('speed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Engine RPM: {vehicleState.rpm.toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min="800"
                    max="6500"
                    value={vehicleState.rpm}
                    onChange={(e) => handleManualChange('rpm', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Gear Position: {vehicleState.gearPosition}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={vehicleState.gearPosition}
                    onChange={(e) => handleManualChange('gearPosition', parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-5 h-5 text-secondary-500" />
              <h3 className="text-lg font-semibold text-white">Driving Scenarios</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedScenario === scenario.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm opacity-75 mt-1">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Additional Parameters */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Additional Parameters</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-900 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Battery className="w-4 h-4 text-success-400" />
                <span className="text-sm text-dark-400">Battery Voltage</span>
              </div>
              <div className="text-lg font-mono text-white">{vehicleState.batteryVoltage.toFixed(1)}V</div>
            </div>
            
            <div className="bg-dark-900 p-3 rounded-lg">
              <div className="text-sm text-dark-400 mb-2">Engine Load</div>
              <div className="text-lg font-mono text-white">{vehicleState.engineLoad.toFixed(0)}%</div>
            </div>
            
            <div className="bg-dark-900 p-3 rounded-lg">
              <div className="text-sm text-dark-400 mb-2">Fuel Level</div>
              <div className="text-lg font-mono text-white">{vehicleState.fuelLevel.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};