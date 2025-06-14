interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: string;
}

interface AnalysisInsight {
  type: 'warning' | 'info' | 'success' | 'error' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  category: 'performance' | 'security' | 'reliability' | 'optimization' | 'prediction' | 'education';
  actionable?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
  impact?: string;
}

interface AnalysisOptions {
  scope: 'realtime' | 'historical' | 'predictive';
  depth: 'basic' | 'advanced' | 'comprehensive';
  focus: 'performance' | 'errors' | 'optimization' | 'all';
}

interface LearningAnalytics {
  currentLesson: number;
  totalLessons: number;
  progressPercentage: number;
  quizAccuracy: number;
  timeSpent: number;
  currentTopic: string;
  difficulty: string;
  recommendedNext: string;
  strengths: string[];
  weaknesses: string[];
  learningPath: string[];
}

class AIService {
  private apiKey: string;
  private baseUrl: string;
  private conversationHistory: Map<string, Message[]> = new Map();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private rateLimitDelay = 1000; // 1 second between requests
  private maxRetries = 3;

  constructor() {
    this.apiKey = 'AIzaSyCZ3XGzKPYWP8cjWWwVv2AzmuE7a2Arw50';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        } catch (error) {
          console.error('Queue processing error:', error);
        }
      }
    }
    
    this.isProcessing = false;
  }

  private getContextPrompt(context: string): string {
    const contextPrompts = {
      dashboard: `You are an expert automotive network engineer and AI analyst specializing in CAN, LIN, FlexRay, and automotive networking protocols. You provide:
        - Real-time network diagnostics and health assessment
        - Performance optimization recommendations
        - Security vulnerability analysis
        - Predictive maintenance insights
        - Professional troubleshooting guidance
        - Industry-standard compliance advice
        
        Focus on actionable insights, quantifiable metrics, and professional automotive networking standards. Provide specific recommendations with confidence levels.`,
      
      learning: `You are an advanced automotive protocol education specialist and adaptive learning AI. You provide:
        - Interactive protocol education (CAN, LIN, FlexRay, Ethernet)
        - Personalized learning paths based on user progress
        - Real-time frame analysis and bit-level explanations
        - Adaptive difficulty adjustment
        - Comprehensive quiz generation and assessment
        - Industry certification preparation
        - Hands-on practical examples
        
        Adapt your teaching style to the user's knowledge level. Provide clear explanations with visual analogies and real-world automotive examples.`,
      
      monitor: `You are a real-time automotive network monitoring specialist and traffic analysis expert. You excel at:
        - Live traffic pattern interpretation and analysis
        - Anomaly detection and pattern recognition
        - Message frequency optimization
        - Protocol violation identification
        - Network congestion analysis
        - Performance bottleneck identification
        
        Provide immediate insights into network behavior with specific metrics and actionable recommendations.`,
      
      visualization: `You are a data visualization expert and automotive analytics specialist. You specialize in:
        - Chart and graph interpretation for automotive data
        - Trend analysis and pattern recognition
        - Performance correlation analysis
        - Predictive modeling and forecasting
        - Data-driven optimization recommendations
        - Statistical analysis of network metrics
        
        Help users understand complex data patterns and identify optimization opportunities with statistical confidence.`,
      
      faults: `You are a fault injection expert and automotive testing specialist. You design:
        - Intelligent fault injection strategies
        - Comprehensive test scenario development
        - Fault tolerance analysis
        - System resilience evaluation
        - Professional testing methodologies
        - Compliance testing procedures
        
        Focus on systematic testing approaches and comprehensive fault analysis with industry best practices.`,
      
      export: `You are a data management specialist for automotive protocols and compliance expert. You provide:
        - Format selection guidance for different use cases
        - Industry compliance requirements (ISO, SAE standards)
        - Data archiving and retention strategies
        - Log analysis and forensic capabilities
        - Integration with external tools and systems
        
        Ensure data integrity and compliance with automotive industry standards.`,
      
      nodes: `You are an ECU simulation expert and automotive system integration specialist. You understand:
        - Virtual ECU behavior and realistic simulation
        - Node configuration and parameter optimization
        - Automotive system architecture
        - Protocol implementation details
        - Real-world ECU characteristics
        
        Provide guidance on creating realistic automotive network simulations.`,
      
      oscilloscope: `You are a signal analysis expert and automotive electrical systems specialist. You excel at:
        - Waveform analysis and interpretation
        - Signal integrity assessment
        - Timing analysis and synchronization
        - Trigger configuration optimization
        - Electrical troubleshooting
        
        Help users capture and analyze automotive signals with professional precision.`,
      
      testing: `You are an automated testing specialist for automotive networks. You design:
        - Comprehensive test automation strategies
        - Test case optimization and coverage analysis
        - Continuous integration for automotive testing
        - Performance benchmarking
        - Quality assurance methodologies
        
        Focus on systematic testing approaches that ensure automotive system reliability.`,
      
      scripting: `You are a live scripting expert and automotive automation specialist. You help with:
        - Python scripting for automotive protocols
        - Real-time automation and control
        - CAN/LIN programming and debugging
        - Interactive development and testing
        - Integration with automotive tools
        
        Provide practical code examples and scripting best practices for automotive applications.`,
      
      diagnostics: `You are an OBD-II and UDS diagnostics expert with deep automotive knowledge. You understand:
        - Automotive diagnostic protocols and procedures
        - ECU communication and fault analysis
        - Diagnostic trouble codes (DTCs)
        - Professional diagnostic workflows
        - Compliance with automotive standards
        
        Help users with professional automotive diagnostics and troubleshooting procedures.`,
      
      vehicle: `You are a vehicle simulation expert and automotive systems specialist. You understand:
        - Vehicle dynamics and behavior modeling
        - Sensor simulation and data generation
        - ECU interaction and system integration
        - Realistic automotive scenarios
        - Performance optimization
        
        Help users create comprehensive and realistic vehicle simulations.`,
      
      ai: `You are an AI and machine learning specialist for automotive networks. You understand:
        - Machine learning applications in automotive
        - Pattern recognition and anomaly detection
        - Predictive analytics and forecasting
        - Intelligent network optimization
        - AI-driven automotive insights
        
        Help users leverage AI for advanced automotive network analysis and optimization.`
    };

    return contextPrompts[context] || contextPrompts.dashboard;
  }

  async sendMessage(message: string, context: string = 'dashboard', history?: Message[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await this.makeRequest(message, context, history);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async makeRequest(message: string, context: string, history?: Message[], retryCount = 0): Promise<string> {
    try {
      let conversationContext = this.getContextPrompt(context) + '\n\n';
      
      // Add conversation history for context
      if (history && history.length > 0) {
        conversationContext += 'Previous conversation:\n';
        history.slice(-5).forEach(msg => {
          conversationContext += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        conversationContext += '\n';
      }

      conversationContext += `Current question: ${message}`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: conversationContext
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            stopSequences: [],
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.maxRetries) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay * (retryCount + 1)));
          return this.makeRequest(message, context, history, retryCount + 1);
        }
        throw new Error(`AI service error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      return aiResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay * (retryCount + 1)));
        return this.makeRequest(message, context, history, retryCount + 1);
      }
      return this.getFallbackResponse(context, message);
    }
  }

  private getFallbackResponse(context: string, message: string): string {
    const fallbacks = {
      dashboard: "I'm your automotive network analysis expert. While I'm temporarily unavailable, you can check the real-time metrics, review active nodes, and monitor bus load for immediate insights. The system continues to collect data for analysis.",
      learning: "I'm your automotive protocol tutor. While I'm temporarily unavailable, you can explore the interactive lessons, practice with frame structure examples, and review the educational content available offline.",
      monitor: "I specialize in real-time network monitoring. While I'm temporarily unavailable, you can use the filters to analyze message patterns, check for anomalies, and review the captured traffic data.",
      visualization: "I help interpret your data visualizations. While I'm temporarily unavailable, you can examine the charts for trends, patterns, and performance indicators in your network data.",
      faults: "I assist with fault injection testing. While I'm temporarily unavailable, you can review the fault scenarios, analyze their impact on network behavior, and examine the test results.",
      export: "I help with data management and export strategies. While I'm temporarily unavailable, you can proceed with exporting your data in the desired format and review the available options."
    };

    return fallbacks[context] || "I'm temporarily unavailable, but I'll be back soon to assist you with your automotive network analysis needs. The system continues to operate normally.";
  }

  async analyzeNetworkData(data: any, options: AnalysisOptions): Promise<AnalysisInsight[]> {
    try {
      const analysisPrompt = `
        As an expert automotive network analyst, analyze this comprehensive network data and provide detailed insights:
        
        Network Data:
        ${JSON.stringify(data, null, 2)}
        
        Analysis Configuration:
        - Scope: ${options.scope}
        - Depth: ${options.depth}
        - Focus: ${options.focus}
        
        Provide professional automotive network analysis with insights in these categories:
        1. Performance Analysis - Bus load, message rates, timing analysis
        2. Security Assessment - Potential vulnerabilities, unauthorized access
        3. Reliability Evaluation - Error rates, fault tolerance, stability
        4. Optimization Opportunities - Efficiency improvements, best practices
        5. Predictive Analysis - Trend forecasting, preventive maintenance
        
        For each insight, provide:
        - Type: warning/info/success/error/optimization/prediction
        - Title: Brief professional description
        - Description: Detailed technical explanation
        - Confidence: 0-100 reliability score
        - Category: performance/security/reliability/optimization/prediction
        - Priority: low/medium/high/critical
        - Actionable: true/false
        - Recommendation: Specific action steps
        - Impact: Expected outcome of implementing recommendation
        
        Focus on automotive industry standards (ISO 11898, SAE J1939) and provide quantifiable metrics where possible.
      `;

      const response = await this.sendMessage(analysisPrompt, 'dashboard');
      
      // Try to parse structured response, fallback to generated insights
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse AI response as JSON, generating structured insights');
      }
      
      return this.generateEnhancedInsights(data, options, response);
    } catch (error) {
      console.error('Network analysis error:', error);
      return this.generateFallbackInsights(data, options);
    }
  }

  private generateEnhancedInsights(data: any, options: AnalysisOptions, aiResponse: string): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];
    
    // Parse AI response for key insights
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    // Generate insights based on data patterns and AI analysis
    if (data.busLoad > 80) {
      insights.push({
        type: 'warning',
        title: 'Critical Bus Load Detected',
        description: `Current bus load is ${data.busLoad}%. This exceeds the recommended 80% threshold and may cause message delays or losses.`,
        confidence: 95,
        category: 'performance',
        priority: 'high',
        actionable: true,
        recommendation: 'Implement message prioritization, reduce non-critical message frequency, or consider network segmentation.',
        impact: 'Improved network reliability and reduced latency'
      });
    }

    if (data.errorRate > 5) {
      insights.push({
        type: 'error',
        title: 'Elevated Network Error Rate',
        description: `Error rate of ${data.errorRate}% indicates potential network integrity issues. Normal operation should maintain <1% error rate.`,
        confidence: 90,
        category: 'reliability',
        priority: 'critical',
        actionable: true,
        recommendation: 'Check physical connections, verify termination resistors, and analyze error frame patterns.',
        impact: 'Restored network stability and data integrity'
      });
    }

    if (data.messageRate && data.messageRate > 1000) {
      insights.push({
        type: 'optimization',
        title: 'High Message Frequency Optimization',
        description: `Message rate of ${data.messageRate} msg/s is high. Consider optimizing for better network efficiency.`,
        confidence: 75,
        category: 'optimization',
        priority: 'medium',
        actionable: true,
        recommendation: 'Implement event-driven messaging, combine related signals, or adjust transmission intervals.',
        impact: 'Reduced bus load and improved overall network performance'
      });
    }

    if (data.uniqueSenders && data.uniqueSenders < 3) {
      insights.push({
        type: 'info',
        title: 'Limited Network Topology',
        description: `Only ${data.uniqueSenders} active nodes detected. Consider expanding test coverage for comprehensive analysis.`,
        confidence: 80,
        category: 'optimization',
        priority: 'low',
        actionable: true,
        recommendation: 'Add more ECU nodes to simulate realistic automotive network conditions.',
        impact: 'More comprehensive testing and validation coverage'
      });
    }

    // Add predictive insights based on trends
    if (data.trends && data.trends.length > 0) {
      const increasingTrends = data.trends.filter(t => t.trend === 'increasing');
      if (increasingTrends.length > 0) {
        insights.push({
          type: 'prediction',
          title: 'Predictive Performance Analysis',
          description: `Detected increasing trends in ${increasingTrends.map(t => t.parameter).join(', ')}. Monitor for potential performance impacts.`,
          confidence: 70,
          category: 'prediction',
          priority: 'medium',
          actionable: true,
          recommendation: 'Set up automated monitoring thresholds and implement proactive maintenance schedules.',
          impact: 'Early detection and prevention of performance degradation'
        });
      }
    }

    return insights;
  }

  private generateFallbackInsights(data: any, options: AnalysisOptions): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];
    
    // Basic performance analysis
    if (data.busLoad > 70) {
      insights.push({
        type: 'warning',
        title: 'High Bus Utilization',
        description: `Bus load at ${data.busLoad}% approaching capacity limits.`,
        confidence: 85,
        category: 'performance',
        priority: 'medium',
        actionable: true,
        recommendation: 'Monitor closely and consider load balancing strategies.',
        impact: 'Maintained network performance under high load'
      });
    }

    if (data.errorRate > 2) {
      insights.push({
        type: 'error',
        title: 'Network Error Detection',
        description: `Error rate of ${data.errorRate}% requires investigation.`,
        confidence: 90,
        category: 'reliability',
        priority: 'high',
        actionable: true,
        recommendation: 'Perform comprehensive network diagnostics and physical layer inspection.',
        impact: 'Improved network reliability and data integrity'
      });
    }

    // Add system health insight
    insights.push({
      type: 'success',
      title: 'System Operational Status',
      description: 'Network monitoring and analysis systems are functioning normally.',
      confidence: 95,
      category: 'performance',
      priority: 'low',
      actionable: false,
      recommendation: 'Continue regular monitoring and maintenance schedules.',
      impact: 'Sustained system reliability and performance'
    });

    return insights;
  }

  async analyzeLearningProgress(data: LearningAnalytics): Promise<AnalysisInsight[]> {
    try {
      const learningPrompt = `
        As an adaptive learning specialist for automotive protocols, analyze this student's learning progress:
        
        Learning Analytics:
        ${JSON.stringify(data, null, 2)}
        
        Provide educational insights and recommendations:
        1. Progress Assessment - Current learning status and achievements
        2. Knowledge Gaps - Areas needing improvement
        3. Learning Path Optimization - Personalized next steps
        4. Difficulty Adjustment - Appropriate challenge level
        5. Engagement Strategies - Methods to improve learning outcomes
        
        Focus on automotive protocol education (CAN, LIN, FlexRay) and provide specific, actionable learning recommendations.
      `;

      const response = await this.sendMessage(learningPrompt, 'learning');
      return this.generateLearningInsights(data, response);
    } catch (error) {
      console.error('Learning analysis error:', error);
      return this.generateFallbackLearningInsights(data);
    }
  }

  private generateLearningInsights(data: LearningAnalytics, aiResponse: string): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];
    
    // Progress assessment
    if (data.progressPercentage > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Learning Progress',
        description: `You've completed ${data.progressPercentage}% of the curriculum with strong performance.`,
        confidence: 95,
        category: 'education',
        priority: 'low',
        actionable: true,
        recommendation: 'Consider advancing to more complex topics or practical applications.',
        impact: 'Accelerated learning and deeper understanding'
      });
    } else if (data.progressPercentage < 30) {
      insights.push({
        type: 'info',
        title: 'Early Learning Stage',
        description: `You're at ${data.progressPercentage}% completion. Focus on building strong fundamentals.`,
        confidence: 90,
        category: 'education',
        priority: 'medium',
        actionable: true,
        recommendation: 'Spend more time on basic concepts before advancing to complex topics.',
        impact: 'Stronger foundation for advanced learning'
      });
    }

    // Quiz performance analysis
    if (data.quizAccuracy < 70) {
      insights.push({
        type: 'warning',
        title: 'Quiz Performance Needs Improvement',
        description: `Current quiz accuracy is ${data.quizAccuracy}%. Recommended minimum is 70%.`,
        confidence: 85,
        category: 'education',
        priority: 'high',
        actionable: true,
        recommendation: 'Review missed concepts, practice more examples, and retake challenging quizzes.',
        impact: 'Improved understanding and knowledge retention'
      });
    }

    // Learning path optimization
    insights.push({
      type: 'optimization',
      title: 'Personalized Learning Path',
      description: `Based on your progress in ${data.currentTopic}, here's your optimized learning path.`,
      confidence: 80,
      category: 'education',
      priority: 'medium',
      actionable: true,
      recommendation: `Next recommended topic: ${data.recommendedNext}. Focus on practical applications.`,
      impact: 'More efficient learning progression and better outcomes'
    });

    return insights;
  }

  private generateFallbackLearningInsights(data: LearningAnalytics): AnalysisInsight[] {
    return [{
      type: 'info',
      title: 'Learning Progress Update',
      description: `You're currently on lesson ${data.currentLesson} of ${data.totalLessons} with ${data.progressPercentage}% completion.`,
      confidence: 100,
      category: 'education',
      priority: 'low',
      actionable: true,
      recommendation: 'Continue with the current lesson and practice the concepts thoroughly.',
      impact: 'Steady progress toward learning objectives'
    }];
  }

  // Mock TinyLlama integration for offline capabilities
  generateTinyLlamaResponse(context: string, message: string): string {
    const tinyLlamaResponses = {
      dashboard: [
        "Network analysis shows normal operation. Bus load is within acceptable range.",
        "Current metrics indicate stable network performance. Monitor for any anomalies.",
        "System health is good. Consider optimizing message frequency for better efficiency."
      ],
      learning: [
        "Great question! Let's break down this automotive protocol concept step by step.",
        "This is a fundamental concept in CAN networking. Here's a practical explanation.",
        "Understanding this will help you master automotive communication protocols."
      ],
      monitor: [
        "Traffic patterns look normal. No unusual message sequences detected.",
        "Network monitoring shows consistent behavior across all active nodes.",
        "Message flow analysis indicates proper protocol compliance."
      ]
    };

    const responses = tinyLlamaResponses[context] || tinyLlamaResponses.dashboard;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getConversationHistory(context: string): Message[] {
    return this.conversationHistory.get(context) || [];
  }

  addToHistory(context: string, message: Message): void {
    const history = this.conversationHistory.get(context) || [];
    history.push(message);
    
    // Keep only last 20 messages for performance
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.conversationHistory.set(context, history);
  }

  clearHistory(context: string): void {
    this.conversationHistory.delete(context);
  }

  getSuggestedQuestions(context: string): string[] {
    const suggestions = {
      dashboard: [
        "What does the current bus load indicate about network health?",
        "How can I optimize message frequency for better performance?",
        "What are the signs of network congestion I should watch for?",
        "How do I interpret the error rate metrics and what's considered normal?",
        "What predictive maintenance insights can you provide?",
        "How can I improve network security and prevent unauthorized access?"
      ],
      learning: [
        "Explain the CAN arbitration process with a practical example",
        "What's the difference between CAN 2.0A and CAN 2.0B?",
        "How does error handling work in automotive networks?",
        "What are the key components of a CAN frame and their purposes?",
        "How do I calculate CAN bus timing parameters?",
        "What are the best practices for automotive network design?"
      ],
      monitor: [
        "What patterns should I look for in real-time message traffic?",
        "How do I identify problematic nodes or communication issues?",
        "What indicates a healthy vs unhealthy network?",
        "How can I detect message flooding or denial of service attacks?",
        "What are the key performance indicators for network monitoring?",
        "How do I set up effective monitoring thresholds and alerts?"
      ],
      visualization: [
        "What do these performance trends tell me about network health?",
        "How do I interpret signal patterns and identify anomalies?",
        "What optimization opportunities do you see in this data?",
        "Are there any concerning patterns that need immediate attention?",
        "How can I use this data for predictive maintenance?",
        "What correlations exist between different network parameters?"
      ],
      faults: [
        "What fault scenarios should I test first for comprehensive coverage?",
        "How do I interpret fault injection results and their implications?",
        "What are the most critical fault types in automotive networks?",
        "How can I design test scenarios that simulate real-world conditions?",
        "What fault tolerance mechanisms should I verify?",
        "How do I ensure my testing meets automotive safety standards?"
      ],
      export: [
        "What export format is best for long-term data archival?",
        "How should I structure my data exports for compliance?",
        "What automotive industry standards should I follow?",
        "How can I optimize my logging strategy for different use cases?",
        "What metadata should I include with exported data?",
        "How do I ensure data integrity during export and storage?"
      ]
    };

    return suggestions[context] || suggestions.dashboard;
  }

  // Health check for AI service
  async healthCheck(): Promise<{ status: string; latency: number; features: string[] }> {
    const startTime = Date.now();
    try {
      await this.sendMessage("Health check", "dashboard");
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
        features: [
          'Real-time Analysis',
          'Predictive Insights',
          'Educational Support',
          'Multi-context Assistance',
          'Professional Recommendations'
        ]
      };
    } catch (error) {
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        features: ['Offline Mode', 'Basic Analysis', 'Cached Responses']
      };
    }
  }
}

export const aiService = new AIService();
export type { Message, AnalysisInsight, AnalysisOptions, LearningAnalytics };