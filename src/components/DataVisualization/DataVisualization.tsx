import React, { useState } from 'react';
import { DataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { SmartDataAnalyzer } from '../AI/SmartDataAnalyzer';

interface DataVisualizationProps {
  dataPoints: DataPoint[];
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ dataPoints }) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('all');
  
  // Group data points by parameter
  const parameters = Array.from(new Set(dataPoints.map(dp => dp.parameter)));
  
  // Prepare chart data
  const chartData = dataPoints
    .filter(dp => selectedParameter === 'all' || dp.parameter === selectedParameter)
    .reduce((acc, dp) => {
      const timeKey = new Date(dp.timestamp).toLocaleTimeString();
      const existing = acc.find(item => item.time === timeKey);
      
      if (existing) {
        existing[dp.parameter] = dp.value;
      } else {
        acc.push({
          time: timeKey,
          timestamp: dp.timestamp,
          [dp.parameter]: dp.value
        });
      }
      
      return acc;
    }, [] as any[])
    .slice(-50); // Show last 50 data points

  const colors = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  const getLatestValues = () => {
    const latest: Record<string, number> = {};
    parameters.forEach(param => {
      const paramData = dataPoints.filter(dp => dp.parameter === param);
      if (paramData.length > 0) {
        latest[param] = paramData[paramData.length - 1].value;
      }
    });
    return latest;
  };

  const latestValues = getLatestValues();

  // Prepare data for AI analysis
  const analysisData = {
    totalDataPoints: dataPoints.length,
    parameters: parameters.length,
    latestValues,
    trends: parameters.map(param => {
      const paramData = dataPoints.filter(dp => dp.parameter === param).slice(-10);
      if (paramData.length < 2) return { parameter: param, trend: 'stable' };
      
      const firstValue = paramData[0].value;
      const lastValue = paramData[paramData.length - 1].value;
      const change = ((lastValue - firstValue) / firstValue) * 100;
      
      return {
        parameter: param,
        trend: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing',
        changePercent: change
      };
    }),
    dataQuality: {
      completeness: (dataPoints.length / Math.max(1, parameters.length * 100)) * 100,
      consistency: parameters.length > 0 ? 100 - (parameters.length * 5) : 100,
      freshness: dataPoints.length > 0 ? Date.now() - dataPoints[dataPoints.length - 1].timestamp : 0
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Data Visualization</h2>
          <div className="flex items-center space-x-3">
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Parameters</option>
              {parameters.map(param => (
                <option key={param} value={param}>{param}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{parameters.length}</div>
            <div className="text-dark-400">Parameters</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-500">{dataPoints.length}</div>
            <div className="text-dark-400">Data Points</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-success-500">{chartData.length}</div>
            <div className="text-dark-400">Displayed</div>
          </div>
          <div className="bg-dark-800 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-accent-500">Live</div>
            <div className="text-dark-400">Status</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization Panel - 65% width */}
        <div className="w-3/5 p-6 space-y-6 overflow-y-auto border-r border-dark-700">
          {/* Real-time Chart */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-white">Real-time Trends</h3>
            </div>
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Legend />
                  {parameters.map((param, index) => (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No data available</p>
                  <p className="text-sm mt-1">Start the simulation to see real-time data</p>
                </div>
              </div>
            )}
          </div>

          {/* Current Values Grid */}
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-success-500" />
              <h3 className="text-lg font-semibold text-white">Current Values</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {parameters.map((param) => (
                <div key={param} className="bg-dark-900 p-4 rounded-lg">
                  <div className="text-sm text-dark-400 mb-1">{param}</div>
                  <div className="text-2xl font-mono text-white">
                    {latestValues[param]?.toFixed(1) || '--'}
                  </div>
                </div>
              ))}
            </div>
            
            {parameters.length === 0 && (
              <div className="text-center text-dark-400 py-8">
                <p>No parameters available</p>
                <p className="text-sm mt-1">Data will appear when simulation starts</p>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Analysis Panel - 35% width */}
        <div className="w-2/5 overflow-y-auto p-6">
          <SmartDataAnalyzer 
            data={analysisData}
            context="visualization"
            autoRefresh={true}
            refreshInterval={15000}
          />
        </div>
      </div>
    </div>
  );
};