import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Minimize2, Maximize2, Sparkles, Brain, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { aiService, Message } from '../../services/aiService';

interface AIAssistantProps {
  context: string;
  title?: string;
  className?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  context, 
  title = "AI Assistant",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiHealth, setAiHealth] = useState<{ status: string; latency: number; features: string[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Load conversation history
    const history = aiService.getConversationHistory(context);
    setMessages(history);
    
    // Load suggested questions
    setSuggestedQuestions(aiService.getSuggestedQuestions(context));

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }

    // Check AI health
    checkAIHealth();
  }, [context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIHealth = async () => {
    try {
      const health = await aiService.healthCheck();
      setAiHealth(health);
    } catch (error) {
      setAiHealth({ status: 'offline', latency: 0, features: ['Offline Mode'] });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);
    aiService.addToHistory(context, userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(text, context, messages);
      
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response,
        timestamp: new Date(),
        context
      };

      setMessages(prev => [...prev, aiMessage]);
      aiService.addToHistory(context, aiMessage);

      // Speak the response if speech synthesis is available
      if (synthesis.current && !isSpeaking) {
        speakMessage(response);
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again. I can still help with offline analysis and cached responses.',
        timestamp: new Date(),
        context
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text: string) => {
    if (synthesis.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthesis.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis.current && isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    aiService.clearHistory(context);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success-500';
      case 'degraded': return 'text-warning-500';
      case 'offline': return 'text-error-500';
      default: return 'text-dark-400';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 group ${className}`}
      >
        <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-success-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-dark-800 border border-dark-700 rounded-lg shadow-2xl z-50 transition-all duration-200 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-white font-medium">{title}</h3>
          {aiHealth && (
            <div className={`w-2 h-2 rounded-full ${
              aiHealth.status === 'healthy' ? 'bg-success-500' : 
              aiHealth.status === 'degraded' ? 'bg-warning-500' : 'bg-error-500'
            } animate-pulse`}></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isMinimized && (
            <>
              <button
                onClick={isSpeaking ? stopSpeaking : () => {}}
                className={`text-white hover:text-primary-200 transition-colors ${isSpeaking ? 'animate-pulse' : ''}`}
                disabled={!synthesis.current}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={isListening ? stopListening : startListening}
                className={`text-white hover:text-primary-200 transition-colors ${isListening ? 'animate-pulse' : ''}`}
                disabled={!recognition.current}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-primary-200 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-primary-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* AI Status */}
          {aiHealth && (
            <div className="px-4 py-2 bg-dark-900 border-b border-dark-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getHealthStatusColor(aiHealth.status)}`}>
                    {aiHealth.status.toUpperCase()}
                  </span>
                  <span className="text-dark-400">•</span>
                  <span className="text-dark-400">{aiHealth.latency}ms</span>
                </div>
                <div className="text-dark-400">
                  {aiHealth.features.length} features active
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.length === 0 && (
              <div className="text-center text-dark-400 py-8">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Hello! I'm your AI assistant for {context}.</p>
                <p className="text-sm mt-1">Ask me anything about automotive networking!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-dark-700 text-dark-100 border border-dark-600'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.type === 'ai' && synthesis.current && (
                      <button
                        onClick={() => speakMessage(message.content)}
                        className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                        disabled={isSpeaking}
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-700 text-dark-100 p-3 rounded-lg border border-dark-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-xs text-dark-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-dark-400 mb-2">Suggested questions:</p>
              <div className="space-y-1">
                {suggestedQuestions.slice(0, 2).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="w-full text-left text-xs text-dark-300 hover:text-white bg-dark-700 hover:bg-dark-600 p-2 rounded transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                rows={1}
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={isLoading || isListening}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {messages.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={clearConversation}
                  className="text-xs text-dark-400 hover:text-white transition-colors"
                >
                  Clear conversation
                </button>
                <div className="text-xs text-dark-400">
                  {messages.length} messages
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};