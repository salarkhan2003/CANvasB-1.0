import { useState, useEffect, useRef } from 'react';
import { CANMessage, ECUNode, DataPoint, FaultInjection } from '../types';

export const useAdvancedCANSimulator = () => {
  const [messages, setMessages] = useState<CANMessage[]>([]);
  const [nodes, setNodes] = useState<ECUNode[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [faults, setFaults] = useState<FaultInjection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [busLoad, setBusLoad] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef(0);

  const ecuTypes = ['Engine', 'Brake', 'Sensor', 'Gateway', 'BCM', 'TCU', 'Custom'] as const;
  const protocols = ['CAN', 'CAN-FD', 'LIN', 'FlexRay'] as const;
  
  // Real-world automotive signals simulation
  const automotiveSignals = {
    Engine: {
      rpm: { min: 800, max: 6500, unit: 'rpm', volatility: 0.1 },
      coolantTemp: { min: 80, max: 110, unit: '°C', volatility: 0.02 },
      oilPressure: { min: 2.0, max: 6.0, unit: 'bar', volatility: 0.05 },
      throttlePosition: { min: 0, max: 100, unit: '%', volatility: 0.3 },
      fuelLevel: { min: 0, max: 100, unit: '%', volatility: 0.001 },
      manifoldPressure: { min: 0.3, max: 2.5, unit: 'bar', volatility: 0.15 }
    },
    Brake: {
      brakePressure: { min: 0, max: 180, unit: 'bar', volatility: 0.2 },
      wheelSpeed_FL: { min: 0, max: 250, unit: 'km/h', volatility: 0.05 },
      wheelSpeed_FR: { min: 0, max: 250, unit: 'km/h', volatility: 0.05 },
      wheelSpeed_RL: { min: 0, max: 250, unit: 'km/h', volatility: 0.05 },
      wheelSpeed_RR: { min: 0, max: 250, unit: 'km/h', volatility: 0.05 },
      absActive: { min: 0, max: 1, unit: 'bool', volatility: 0.1 }
    },
    Sensor: {
      ambientTemp: { min: -40, max: 60, unit: '°C', volatility: 0.01 },
      humidity: { min: 0, max: 100, unit: '%', volatility: 0.02 },
      batteryVoltage: { min: 11.5, max: 14.8, unit: 'V', volatility: 0.01 },
      fuelPressure: { min: 3.0, max: 5.5, unit: 'bar', volatility: 0.03 },
      airflow: { min: 0, max: 500, unit: 'kg/h', volatility: 0.1 }
    },
    Gateway: {
      busLoad: { min: 0, max: 100, unit: '%', volatility: 0.05 },
      errorCount: { min: 0, max: 255, unit: 'count', volatility: 0.02 },
      messageRate: { min: 0, max: 1000, unit: 'msg/s', volatility: 0.1 }
    },
    BCM: {
      leftTurnSignal: { min: 0, max: 1, unit: 'bool', volatility: 0.1 },
      rightTurnSignal: { min: 0, max: 1, unit: 'bool', volatility: 0.1 },
      headlights: { min: 0, max: 1, unit: 'bool', volatility: 0.05 },
      doorStatus: { min: 0, max: 15, unit: 'bitmap', volatility: 0.02 },
      windowPosition: { min: 0, max: 100, unit: '%', volatility: 0.03 }
    },
    TCU: {
      gearPosition: { min: 0, max: 8, unit: 'gear', volatility: 0.05 },
      clutchPosition: { min: 0, max: 100, unit: '%', volatility: 0.1 },
      transmissionTemp: { min: 60, max: 120, unit: '°C', volatility: 0.02 },
      torqueRequest: { min: 0, max: 500, unit: 'Nm', volatility: 0.15 }
    }
  };

  const sampleNodes: ECUNode[] = [
    {
      id: 'ecu_engine',
      name: 'Engine Control Unit',
      type: 'Engine',
      status: 'active',
      protocol: 'CAN',
      messages: [],
      parameters: { rpm: 2500, coolantTemp: 85, throttlePosition: 45, oilPressure: 4.2 }
    },
    {
      id: 'ecu_brake',
      name: 'Anti-lock Brake System',
      type: 'Brake',
      status: 'active',
      protocol: 'CAN',
      messages: [],
      parameters: { brakePressure: 12, wheelSpeed_FL: 75, wheelSpeed_FR: 75, absActive: 0 }
    },
    {
      id: 'ecu_gateway',
      name: 'Central Gateway',
      type: 'Gateway',
      status: 'active',
      protocol: 'CAN-FD',
      messages: [],
      parameters: { busLoad: 35, errorCount: 2, messageRate: 450 }
    },
    {
      id: 'ecu_bcm',
      name: 'Body Control Module',
      type: 'BCM',
      status: 'active',
      protocol: 'LIN',
      messages: [],
      parameters: { leftTurnSignal: 0, rightTurnSignal: 0, headlights: 1, doorStatus: 0 }
    }
  ];

  useEffect(() => {
    setNodes(sampleNodes);
  }, []);

  const generateRealisticMessage = (node: ECUNode): CANMessage => {
    const arbitrationIds = {
      Engine: ['0x7E0', '0x7E8', '0x7DF', '0x123'],
      Brake: ['0x1A0', '0x1A1', '0x1A2', '0x456'],
      Sensor: ['0x3C0', '0x3C1', '0x3C2', '0x789'],
      Gateway: ['0x7FF', '0x7FE', '0x7FD', '0xABC'],
      BCM: ['0x2A0', '0x2A1', '0x2A2', '0xDEF'],
      TCU: ['0x1C0', '0x1C1', '0x1C2', '0x321'],
      Custom: ['0xAAA', '0xBBB', '0xCCC', '0xDDD']
    };

    const nodeSignals = automotiveSignals[node.type] || automotiveSignals.Sensor;
    const signalNames = Object.keys(nodeSignals);
    const selectedSignal = signalNames[Math.floor(Math.random() * signalNames.length)];
    const signalConfig = nodeSignals[selectedSignal];

    // Generate realistic data based on signal configuration
    let value = node.parameters[selectedSignal] || signalConfig.min;
    const variation = (Math.random() - 0.5) * 2 * signalConfig.volatility * (signalConfig.max - signalConfig.min);
    value = Math.max(signalConfig.min, Math.min(signalConfig.max, value + variation));

    // Update node parameters
    node.parameters[selectedSignal] = value;

    // Convert value to hex data (simplified)
    const scaledValue = Math.round((value - signalConfig.min) / (signalConfig.max - signalConfig.min) * 65535);
    const dataBytes = [
      (scaledValue >> 8) & 0xFF,
      scaledValue & 0xFF,
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    ];

    const data = dataBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    const arbitrationId = arbitrationIds[node.type][Math.floor(Math.random() * arbitrationIds[node.type].length)];

    // Apply fault injection effects
    let frameType: 'data' | 'remote' | 'error' | 'overload' = 'data';
    let crcValid = true;
    let errorFlags: string[] = [];

    const activeFaults = faults.filter(f => f.active && f.target === node.name);
    activeFaults.forEach(fault => {
      switch (fault.type) {
        case 'bit_error':
          if (Math.random() < 0.1) {
            const byteIndex = Math.floor(Math.random() * dataBytes.length);
            dataBytes[byteIndex] ^= (1 << Math.floor(Math.random() * 8));
            errorFlags.push('BIT_ERROR');
          }
          break;
        case 'corrupt_crc':
          if (Math.random() < 0.2) {
            crcValid = false;
            errorFlags.push('CRC_ERROR');
          }
          break;
        case 'bus_off':
          if (Math.random() < 0.05) {
            frameType = 'error';
            errorFlags.push('BUS_OFF');
          }
          break;
      }
    });

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      arbitrationId,
      data,
      dlc: node.protocol === 'CAN-FD' ? Math.floor(Math.random() * 64) + 1 : 8,
      sender: node.name,
      type: node.protocol as any,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      frameType,
      crcValid,
      errorFlags
    };
  };

  const startSimulation = () => {
    setIsRunning(true);
    messageCountRef.current = 0;
    
    intervalRef.current = setInterval(() => {
      const activeNodes = nodes.filter(node => node.status === 'active');
      let newMessages: CANMessage[] = [];
      
      activeNodes.forEach(node => {
        // Different protocols have different message rates
        const messageRate = {
          'CAN': 0.7,
          'CAN-FD': 0.8,
          'LIN': 0.3,
          'FlexRay': 0.9
        }[node.protocol] || 0.7;

        if (Math.random() < messageRate) {
          const message = generateRealisticMessage(node);
          newMessages.push(message);
          messageCountRef.current++;
          
          // Update data points for visualization
          const nodeSignals = automotiveSignals[node.type] || automotiveSignals.Sensor;
          Object.entries(node.parameters).forEach(([param, value]) => {
            const signalConfig = nodeSignals[param];
            if (signalConfig) {
              setDataPoints(prev => [
                ...prev.slice(-299),
                { 
                  timestamp: Date.now(), 
                  value, 
                  parameter: `${node.name}_${param}`,
                  unit: signalConfig.unit,
                  signal: param
                }
              ]);
            }
          });
        }
      });
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev.slice(-199), ...newMessages]);
      }
      
      // Update bus statistics
      setBusLoad(Math.min(100, (messageCountRef.current / 10) * 2));
      setErrorRate(newMessages.filter(m => m.errorFlags && m.errorFlags.length > 0).length / Math.max(1, newMessages.length) * 100);
      
    }, 100 + Math.random() * 200); // More realistic timing
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBusLoad(0);
    setErrorRate(0);
  };

  const addNode = (name: string, type: typeof ecuTypes[number], protocol: typeof protocols[number] = 'CAN') => {
    const nodeSignals = automotiveSignals[type] || automotiveSignals.Sensor;
    const initialParams: Record<string, number> = {};
    
    Object.entries(nodeSignals).forEach(([param, config]) => {
      initialParams[param] = config.min + (config.max - config.min) * 0.5;
    });

    const newNode: ECUNode = {
      id: `ecu_${Date.now()}`,
      name,
      type,
      protocol,
      status: 'active',
      messages: [],
      parameters: initialParams
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNodeStatus = (nodeId: string, status: ECUNode['status']) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, status } : node
    ));
  };

  const addFault = (fault: Omit<FaultInjection, 'id'>) => {
    const newFault: FaultInjection = {
      ...fault,
      id: `fault_${Date.now()}`
    };
    setFaults(prev => [...prev, newFault]);
  };

  const toggleFault = (faultId: string) => {
    setFaults(prev => prev.map(fault => 
      fault.id === faultId ? { ...fault, active: !fault.active } : fault
    ));
  };

  const clearMessages = () => {
    setMessages([]);
    setDataPoints([]);
    messageCountRef.current = 0;
    setBusLoad(0);
    setErrorRate(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
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
  };
};