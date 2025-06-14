import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Shield, Zap, Target, RefreshCw, AlertTriangle, CheckCircle, Info, Activity, BarChart3 } from 'lucide-react';
import { aiService, AnalysisInsight, AnalysisOptions } from '../../services/aiService';

interface SmartDataAnalyzerProps {
  data: any;
  context: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const SmartDataAnalyzer: React.FC<SmartDataAnalyzerProps> = ({
  data,
  context,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    scope: 'realtime',
    depth: 'advanced',
    focus: 'all'
  });
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<{ status: string; latency: number } | null>(null);

  useEffect(() => {
    if (data) {
      analyzeData();
    }
  }, [data, analysisOptions]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (data && !isAnalyzing) {
          analyzeData();
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, data, isAnalyzing]);

  const analyzeData = async () => {
    if (!data || isAnalyzing) return;

    setIsAnalyzing(true);
    const startTime = Date.now();
    
    try {
      const analysisResults = await aiService.analyzeNetworkData(data, analysisOptions);
      setInsights(analysisResults);
      setLastAnalysis(new Date());
      
      const latency = Date.now() - startTime;
      setAiHealth({ status: 'healthy', latency });
    } catch (error) {
      console.error('Analysis error:', error);
      setAiHealth({ status: 'error', latency: Date.now() - startTime });
      
      // Fallback to basic analysis
      const fallbackInsights: AnalysisInsight[] = [
        {
          type: 'info',
          title: 'AI Analysis Unavailable',
          description: 'Using offline analysis mode. Basic insights are still available.',
          confidence: 100,
          category: 'performance',
          priority: 'low',
          actionable: false
        }
      ];
      setInsights(fallbackInsights);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'optimization': return <Target className="w-5 h-5" />;
      case 'prediction': return <TrendingUp className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning-500 bg-warning-500/10 border-warning-500/20';
      case 'error': return 'text-error-500 bg-error-500/10 border-error-500/20';
      case 'success': return 'text-success-500 bg-success-500/10 border-success-500/20';
      case 'optimization': return 'text-primary-500 bg-primary-500/10 border-primary-500/20';
      case 'prediction': return 'text-accent-500 bg-accent-500/10 border-accent-500/20';
      default: return 'text-dark-400 bg-dark-500/10 border-dark-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-error-600 text-white';
      case 'high': return 'bg-error-500 text-white';
      case 'medium': return 'bg-warning-500 text-white';
      case 'low': return 'bg-success-500 text-white';
      default: return 'bg-dark-600 text-dark-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'reliability': return <CheckCircle className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'prediction': return <Brain className="w-4 h-4" />;
      case 'education': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = [];
    }
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<string, AnalysisInsight[]>);

  const criticalInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high');
  const avgConfidence = insights.length > 0 ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length) : 0;

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">AI Network Analyzer</h3>
          {aiHealth && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              aiHealth.status === 'healthy' ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400'
            }`}>
              {aiHealth.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={analysisOptions.depth}
            onChange={(e) => setAnalysisOptions(prev => ({ ...prev, depth: e.target.value as any }))}
            className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="basic">Basic Analysis</option>
            <option value="advanced">Advanced Analysis</option>
            <option value="comprehensive">Comprehensive Analysis</option>
          </select>
          
          <button
            onClick={analyzeData}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded text-sm flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Status Dashboard */}
      <div className="mb-6 p-4 bg-dark-900 rounded-lg">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{insights.length}</div>
            <div className="text-dark-400">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error-400">{criticalInsights.length}</div>
            <div className="text-dark-400">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{avgConfidence}%</div>
            <div className="text-dark-400">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isAnalyzing ? 'text-warning-400' : 'text-success-400'}`}>
              {isAnalyzing ? 'ANALYZING' : 'READY'}
            </div>
            <div className="text-dark-400">Status</div>
          </div>
        </div>
        
        {lastAnalysis && (
          <div className="mt-3 text-center text-xs text-dark-400">
            Last analysis: {lastAnalysis.toLocaleTimeString()}
            {aiHealth && ` • ${aiHealth.latency}ms response time`}
          </div>
        )}
      </div>

      {/* Analysis Configuration */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Analysis Scope</label>
          <select
            value={analysisOptions.scope}
            onChange={(e) => setAnalysisOptions(prev => ({ ...prev, scope: e.target.value as any }))}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="realtime">Real-time</option>
            <option value="historical">Historical</option>
            <option value="predictive">Predictive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Focus Area</label>
          <select
            value={analysisOptions.focus}
            onChange={(e) => setAnalysisOptions(prev => ({ ...prev, focus: e.target.value as any }))}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Areas</option>
            <option value="performance">Performance</option>
            <option value="errors">Error Analysis</option>
            <option value="optimization">Optimization</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAnalysisOptions(prev => ({ ...prev }))}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
            />
            <span className="text-dark-300 text-sm">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Insights by Category */}
      {Object.keys(groupedInsights).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <h4 className="text-white font-medium capitalize">{category} Analysis</h4>
                <span className="text-dark-400 text-sm">({categoryInsights.length})</span>
              </div>
              
              <div className="space-y-2">
                {categoryInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${getInsightColor(insight.type)} ${
                      expandedInsight === `${category}-${index}` ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setExpandedInsight(
                      expandedInsight === `${category}-${index}` ? null : `${category}-${index}`
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <h5 className="font-medium">{insight.title}</h5>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {insight.priority && (
                          <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(insight.priority)}`}>
                            {insight.priority.toUpperCase()}
                          </span>
                        )}
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                            Actionable
                          </span>
                        )}
                        <span className="text-xs opacity-75">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm opacity-90 mb-2">{insight.description}</p>
                    
                    {expandedInsight === `${category}-${index}` && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        {insight.recommendation && (
                          <div className="mb-2">
                            <span className="text-xs font-medium opacity-75">Recommendation:</span>
                            <p className="text-sm mt-1">{insight.recommendation}</p>
                          </div>
                        )}
                        {insight.impact && (
                          <div>
                            <span className="text-xs font-medium opacity-75">Expected Impact:</span>
                            <p className="text-sm mt-1">{insight.impact}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-dark-400 py-8">
          {isAnalyzing ? (
            <div>
              <Brain className="w-12 h-12 mx-auto mb-3 animate-pulse" />
              <p>AI is analyzing your network data...</p>
              <p className="text-sm mt-1">This may take a few moments</p>
            </div>
          ) : (
            <div>
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No insights available</p>
              <p className="text-sm mt-1">Start the simulation to generate AI insights</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};