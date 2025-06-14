import { useState, useEffect, useRef } from 'react';
import { CANMessage, ECUNode, DataPoint } from '../types';

export const useCANSimulator = () => {
  const [messages, setMessages] = useState<CANMessage[]>([]);
  const [nodes, setNodes] = useState<ECUNode[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const ecuTypes = ['Engine', 'Brake', 'Sensor', 'Custom'] as const;
  
  const sampleNodes: ECUNode[] = [
    {
      id: 'ecu_engine',
      name: 'Engine ECU',
      type: 'Engine',
      status: 'active',
      messages: [],
      parameters: { rpm: 2500, temperature: 85, load: 45 }
    },
    {
      id: 'ecu_brake',
      name: 'Brake ECU',
      type: 'Brake',
      status: 'active',
      messages: [],
      parameters: { pressure: 1.2, temperature: 65, status: 1 }
    },
    {
      id: 'ecu_sensor',
      name: 'Sensor Node',
      type: 'Sensor',
      status: 'active',
      messages: [],
      parameters: { speed: 75, fuel: 68, voltage: 12.4 }
    }
  ];

  useEffect(() => {
    setNodes(sampleNodes);
  }, []);

  const generateMessage = (node: ECUNode): CANMessage => {
    const arbitrationIds = {
      Engine: '0x123',
      Brake: '0x456',
      Sensor: '0x789',
      Custom: '0xABC'
    };

    const data = Object.values(node.parameters)
      .map(val => val.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      arbitrationId: arbitrationIds[node.type],
      data: data.toUpperCase(),
      dlc: Math.min(8, Math.ceil(data.length / 2)),
      sender: node.name,
      type: Math.random() > 0.8 ? 'LIN' : 'CAN',
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
    };
  };

  const startSimulation = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      const activeNodes = nodes.filter(node => node.status === 'active');
      
      activeNodes.forEach(node => {
        if (Math.random() > 0.3) { // 70% chance to send message
          const message = generateMessage(node);
          setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          
          // Update data points for visualization
          Object.entries(node.parameters).forEach(([param, value]) => {
            const variation = (Math.random() - 0.5) * 10;
            const newValue = Math.max(0, value + variation);
            
            setDataPoints(prev => [
              ...prev.slice(-199),
              { timestamp: Date.now(), value: newValue, parameter: `${node.name}_${param}` }
            ]);
            
            // Update node parameters
            setNodes(prevNodes => 
              prevNodes.map(n => 
                n.id === node.id 
                  ? { ...n, parameters: { ...n.parameters, [param]: newValue } }
                  : n
              )
            );
          });
        }
      });
    }, 500 + Math.random() * 1000); // Random interval between 500ms-1.5s
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const addNode = (name: string, type: typeof ecuTypes[number]) => {
    const newNode: ECUNode = {
      id: `ecu_${Date.now()}`,
      name,
      type,
      status: 'active',
      messages: [],
      parameters: {
        param1: Math.floor(Math.random() * 100),
        param2: Math.floor(Math.random() * 100),
        param3: Math.floor(Math.random() * 100)
      }
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNodeStatus = (nodeId: string, status: 'active' | 'inactive' | 'error') => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, status } : node
    ));
  };

  const clearMessages = () => {
    setMessages([]);
    setDataPoints([]);
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
    isRunning,
    startSimulation,
    stopSimulation,
    addNode,
    updateNodeStatus,
    clearMessages,
    ecuTypes
  };
};