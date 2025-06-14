export interface CANMessage {
  id: string;
  timestamp: number;
  arbitrationId: string;
  data: string;
  dlc: number;
  sender: string;
  type: 'CAN' | 'CAN-FD' | 'LIN' | 'FlexRay' | 'I2C' | 'SPI';
  priority: 'high' | 'medium' | 'low';
  frameType?: 'data' | 'remote' | 'error' | 'overload';
  crcValid?: boolean;
  errorFlags?: string[];
}

export interface ECUNode {
  id: string;
  name: string;
  type: 'Engine' | 'Brake' | 'Sensor' | 'Gateway' | 'BCM' | 'TCU' | 'Custom';
  status: 'active' | 'inactive' | 'error' | 'bus-off';
  messages: CANMessage[];
  parameters: Record<string, number>;
  scriptEnabled?: boolean;
  scriptContent?: string;
  protocol: 'CAN' | 'CAN-FD' | 'LIN' | 'FlexRay';
}

export interface FaultInjection {
  id: string;
  type: 'bit_error' | 'bus_off' | 'dominant_flip' | 'timeout' | 'drop_message' | 'delay_message' | 'duplicate_message' | 'corrupt_crc' | 'short_circuit';
  target: string;
  active: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  parameters?: Record<string, any>;
}

export interface DataPoint {
  timestamp: number;
  value: number;
  parameter: string;
  unit?: string;
  signal?: string;
}

export interface DBCSignal {
  name: string;
  startBit: number;
  length: number;
  factor: number;
  offset: number;
  unit: string;
  min: number;
  max: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  results?: TestResult[];
}

export interface TestStep {
  id: string;
  type: 'send_message' | 'wait' | 'expect_message' | 'inject_fault' | 'check_signal';
  parameters: Record<string, any>;
  timeout?: number;
}

export interface TestResult {
  stepId: string;
  status: 'passed' | 'failed';
  message: string;
  timestamp: number;
}

export interface OBDCommand {
  pid: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
}

export interface UDSService {
  id: string;
  name: string;
  description: string;
  subfunctions?: UDSSubfunction[];
}

export interface UDSSubfunction {
  id: string;
  name: string;
  description: string;
}