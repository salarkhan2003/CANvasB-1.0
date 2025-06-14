import React, { useState, useEffect } from 'react';
import { GraduationCap, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Brain, BookOpen, Target, Award } from 'lucide-react';
import { SmartDataAnalyzer } from '../AI/SmartDataAnalyzer';
import { aiService, LearningAnalytics } from '../../services/aiService';

export const ProtocolLearning: React.FC = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [learningProgress, setLearningProgress] = useState({
    completedLessons: 0,
    totalLessons: 6,
    quizScore: 0,
    timeSpent: 0,
    strengths: ['Frame Structure', 'Basic Concepts'],
    weaknesses: ['Advanced Timing', 'Error Handling'],
    learningPath: ['CAN Basics', 'LIN Protocol', 'FlexRay Advanced']
  });
  const [aiTutorActive, setAiTutorActive] = useState(true);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [isAskingTutor, setIsAskingTutor] = useState(false);

  const lessons = [
    {
      title: 'CAN Frame Structure Fundamentals',
      content: 'The CAN frame consists of several critical fields: Start of Frame (SOF), Arbitration Field, Control Field, Data Field, CRC Field, ACK Field, and End of Frame (EOF). Each field serves a specific purpose in ensuring reliable communication.',
      frame: '0 01110100001 0 0000 10101010 1111100011010101 1 1 1 1111111',
      fields: [
        { name: 'SOF', start: 0, length: 1, color: 'bg-primary-500', description: 'Dominant bit marking frame start' },
        { name: 'Arbitration ID', start: 1, length: 11, color: 'bg-secondary-500', description: 'Message identifier and priority' },
        { name: 'RTR', start: 12, length: 1, color: 'bg-accent-500', description: 'Remote Transmission Request' },
        { name: 'Control', start: 13, length: 6, color: 'bg-warning-500', description: 'Data Length Code and reserved bits' },
        { name: 'Data', start: 19, length: 16, color: 'bg-success-500', description: 'Actual payload data (0-8 bytes)' },
        { name: 'CRC', start: 35, length: 16, color: 'bg-error-500', description: 'Cyclic Redundancy Check + delimiter' },
        { name: 'ACK', start: 51, length: 2, color: 'bg-purple-500', description: 'Acknowledgment slot + delimiter' },
        { name: 'EOF', start: 53, length: 7, color: 'bg-dark-500', description: 'End of Frame marker' }
      ],
      difficulty: 'Beginner',
      estimatedTime: '15 minutes'
    },
    {
      title: 'LIN Frame Structure & Protocol',
      content: 'LIN (Local Interconnect Network) uses a simpler master-slave architecture. The frame structure includes: Sync Break, Sync Field, Protected Identifier (PID), and Response containing data and checksum.',
      frame: '00000000 01010101 11001100 10101010 11110000 01010101',
      fields: [
        { name: 'Sync Break', start: 0, length: 8, color: 'bg-primary-500', description: 'Dominant field for synchronization' },
        { name: 'Sync Field', start: 8, length: 8, color: 'bg-secondary-500', description: 'Bit timing synchronization' },
        { name: 'PID', start: 16, length: 8, color: 'bg-accent-500', description: 'Protected Identifier with parity' },
        { name: 'Data', start: 24, length: 16, color: 'bg-success-500', description: 'Response data (2-8 bytes)' },
        { name: 'Checksum', start: 40, length: 8, color: 'bg-error-500', description: 'Error detection checksum' }
      ],
      difficulty: 'Beginner',
      estimatedTime: '12 minutes'
    },
    {
      title: 'CAN Arbitration & Priority',
      content: 'CAN uses CSMA/CD with non-destructive arbitration. Lower arbitration IDs have higher priority. During arbitration, nodes compare their transmitted bits with the bus state.',
      frame: '0 00000000001 0 0000 vs 0 00000000010 0 0000',
      fields: [
        { name: 'Higher Priority', start: 0, length: 15, color: 'bg-success-500', description: 'ID 0x001 wins arbitration' },
        { name: 'Lower Priority', start: 16, length: 15, color: 'bg-error-500', description: 'ID 0x002 loses arbitration' }
      ],
      difficulty: 'Intermediate',
      estimatedTime: '20 minutes'
    },
    {
      title: 'Error Detection & Handling',
      content: 'CAN implements multiple error detection mechanisms: CRC errors, form errors, acknowledgment errors, bit errors, and stuff errors. Error frames are transmitted when errors are detected.',
      frame: 'ERROR FRAME: 000000 + Error Delimiter + Intermission',
      fields: [
        { name: 'Error Flag', start: 0, length: 6, color: 'bg-error-500', description: '6 dominant bits violating stuff rule' },
        { name: 'Error Delimiter', start: 6, length: 8, color: 'bg-warning-500', description: '8 recessive bits' },
        { name: 'Intermission', start: 14, length: 3, color: 'bg-dark-500', description: '3 recessive bits minimum' }
      ],
      difficulty: 'Advanced',
      estimatedTime: '25 minutes'
    },
    {
      title: 'FlexRay Advanced Features',
      content: 'FlexRay provides deterministic communication with time-triggered and event-triggered segments. It supports redundant channels and advanced error handling.',
      frame: 'Static Segment | Dynamic Segment | Symbol Window | NIT',
      fields: [
        { name: 'Static Segment', start: 0, length: 8, color: 'bg-primary-500', description: 'Time-triggered communication' },
        { name: 'Dynamic Segment', start: 8, length: 6, color: 'bg-secondary-500', description: 'Event-triggered communication' },
        { name: 'Symbol Window', start: 14, length: 2, color: 'bg-accent-500', description: 'Special symbol transmission' },
        { name: 'NIT', start: 16, length: 4, color: 'bg-warning-500', description: 'Network Idle Time' }
      ],
      difficulty: 'Expert',
      estimatedTime: '30 minutes'
    },
    {
      title: 'Automotive Ethernet & DoIP',
      content: 'Modern vehicles use Ethernet for high-bandwidth applications. Diagnostics over IP (DoIP) enables remote diagnostics and software updates.',
      frame: 'Ethernet Header | IP Header | UDP/TCP | DoIP Header | UDS Data',
      fields: [
        { name: 'Ethernet', start: 0, length: 4, color: 'bg-primary-500', description: 'Layer 2 frame header' },
        { name: 'IP', start: 4, length: 4, color: 'bg-secondary-500', description: 'Network layer header' },
        { name: 'Transport', start: 8, length: 2, color: 'bg-accent-500', description: 'UDP or TCP header' },
        { name: 'DoIP', start: 10, length: 3, color: 'bg-warning-500', description: 'Diagnostics over IP' },
        { name: 'UDS', start: 13, length: 5, color: 'bg-success-500', description: 'Unified Diagnostic Services' }
      ],
      difficulty: 'Expert',
      estimatedTime: '35 minutes'
    }
  ];

  const quizQuestions = [
    {
      question: 'What does SOF stand for in CAN protocol?',
      options: ['Start of Frame', 'Start of Field', 'Source of Frame', 'Serial Output Frame'],
      correct: 'Start of Frame',
      explanation: 'SOF (Start of Frame) is a dominant bit that marks the beginning of a CAN frame and synchronizes all nodes.'
    },
    {
      question: 'How many bits is the CAN Arbitration ID in standard format?',
      options: ['8 bits', '11 bits', '16 bits', '29 bits'],
      correct: '11 bits',
      explanation: 'Standard CAN uses an 11-bit arbitration ID, while extended CAN uses 29 bits.'
    },
    {
      question: 'In CAN arbitration, which ID has higher priority?',
      options: ['Higher numerical value', 'Lower numerical value', 'Longer ID', 'First transmitted'],
      correct: 'Lower numerical value',
      explanation: 'Lower arbitration IDs have higher priority in CAN. ID 0x001 beats ID 0x002.'
    },
    {
      question: 'What is the maximum data payload in a standard CAN frame?',
      options: ['4 bytes', '8 bytes', '16 bytes', '64 bytes'],
      correct: '8 bytes',
      explanation: 'Standard CAN supports up to 8 bytes of data payload. CAN-FD can support up to 64 bytes.'
    },
    {
      question: 'What triggers an error frame in CAN?',
      options: ['High bus load', 'CRC mismatch', 'Low voltage', 'Network congestion'],
      correct: 'CRC mismatch',
      explanation: 'Error frames are triggered by various error conditions including CRC errors, form errors, and bit errors.'
    }
  ];

  const currentQuiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];

  useEffect(() => {
    // Simulate time tracking
    if (isPlaying) {
      const interval = setInterval(() => {
        setLearningProgress(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleQuizSubmit = () => {
    setShowResult(true);
    if (selectedAnswer === currentQuiz.correct) {
      setLearningProgress(prev => ({ 
        ...prev, 
        quizScore: prev.quizScore + 1,
        completedLessons: Math.max(prev.completedLessons, currentLesson + 1)
      }));
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer('');
    setShowResult(false);
  };

  const askAITutor = async () => {
    if (!tutorQuestion.trim() || isAskingTutor) return;

    setIsAskingTutor(true);
    try {
      const context = `Learning context: Currently studying "${lessons[currentLesson].title}" - ${lessons[currentLesson].content}`;
      const response = await aiService.sendMessage(
        `${context}\n\nStudent question: ${tutorQuestion}`,
        'learning'
      );
      setTutorResponse(response);
    } catch (error) {
      setTutorResponse('I apologize, but I cannot provide a response right now. Please refer to the lesson content or try again later.');
    } finally {
      setIsAskingTutor(false);
    }
  };

  // Prepare learning analytics data
  const learningData: LearningAnalytics = {
    currentLesson: currentLesson + 1,
    totalLessons: lessons.length,
    progressPercentage: (learningProgress.completedLessons / learningProgress.totalLessons) * 100,
    quizAccuracy: learningProgress.quizScore > 0 ? (learningProgress.quizScore / quizQuestions.length) * 100 : 0,
    timeSpent: learningProgress.timeSpent,
    currentTopic: lessons[currentLesson]?.title || 'Unknown',
    difficulty: lessons[currentLesson]?.difficulty || 'Beginner',
    recommendedNext: currentLesson < lessons.length - 1 ? lessons[currentLesson + 1]?.title : 'Advanced Certification',
    strengths: learningProgress.strengths,
    weaknesses: learningProgress.weaknesses,
    learningPath: learningProgress.learningPath
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Interactive Protocol Learning</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAiTutorActive(!aiTutorActive)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                aiTutorActive 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-1" />
              AI Tutor
            </button>
            <button
              onClick={() => setQuizMode(!quizMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                quizMode 
                  ? 'bg-accent-600 hover:bg-accent-700 text-white' 
                  : 'bg-dark-700 hover:bg-dark-600 text-dark-300'
              }`}
            >
              {quizMode ? 'Exit Quiz' : 'Quiz Mode'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="text-dark-300">
              {quizMode ? 'Knowledge Assessment' : `Lesson ${currentLesson + 1} of ${lessons.length}`}
            </span>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-dark-400">
                {lessons[currentLesson]?.difficulty} • {lessons[currentLesson]?.estimatedTime}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-success-500" />
              <span className="text-dark-300">Progress: {Math.round(learningData.progressPercentage)}%</span>
            </div>
            <div className="text-dark-400">
              Score: {learningProgress.quizScore}/{quizQuestions.length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Learning Content - 60% width */}
        <div className="w-3/5 overflow-y-auto border-r border-dark-700">
          {!quizMode ? (
            <div className="p-6 space-y-6">
              {/* Lesson Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
                    disabled={currentLesson === lessons.length - 1}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      isPlaying 
                        ? 'bg-warning-600 hover:bg-warning-700 text-white' 
                        : 'bg-success-600 hover:bg-success-700 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Start'} Learning</span>
                  </button>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-white">
                    {lessons[currentLesson].title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lessons[currentLesson].difficulty === 'Beginner' ? 'bg-success-500/20 text-success-400' :
                    lessons[currentLesson].difficulty === 'Intermediate' ? 'bg-warning-500/20 text-warning-400' :
                    lessons[currentLesson].difficulty === 'Advanced' ? 'bg-error-500/20 text-error-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {lessons[currentLesson].difficulty}
                  </span>
                </div>
                <p className="text-dark-300 mb-6 leading-relaxed">{lessons[currentLesson].content}</p>
                
                {/* Frame Visualization */}
                <div className="bg-dark-900 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Frame Structure Analysis:</h4>
                  <div className="font-mono text-sm text-white bg-black p-3 rounded border overflow-x-auto mb-4">
                    {lessons[currentLesson].frame}
                  </div>
                  
                  {/* Field Legend with Descriptions */}
                  <div className="space-y-3">
                    {lessons[currentLesson].fields.map((field, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-dark-800 rounded-lg">
                        <div className={`w-4 h-4 rounded mt-0.5 ${field.color}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-white">{field.name}</span>
                            <span className="text-xs text-dark-400">({field.length} bit{field.length > 1 ? 's' : ''})</span>
                          </div>
                          <p className="text-xs text-dark-300">{field.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Tutor Section */}
              {aiTutorActive && (
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="w-5 h-5 text-primary-500" />
                    <h4 className="text-white font-medium">Ask Your AI Tutor</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tutorQuestion}
                        onChange={(e) => setTutorQuestion(e.target.value)}
                        placeholder="Ask anything about this lesson..."
                        className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && askAITutor()}
                      />
                      <button
                        onClick={askAITutor}
                        disabled={isAskingTutor || !tutorQuestion.trim()}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                      >
                        {isAskingTutor ? 'Asking...' : 'Ask'}
                      </button>
                    </div>
                    
                    {tutorResponse && (
                      <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Brain className="w-5 h-5 text-primary-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-primary-300 font-medium mb-1">AI Tutor Response:</p>
                            <p className="text-sm text-dark-200">{tutorResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Controls */}
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Learning Progress</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-300">Lesson Completion</span>
                    <span className="text-primary-400">{Math.round(learningData.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${learningData.progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-success-400">{learningProgress.completedLessons}</div>
                      <div className="text-xs text-dark-400">Lessons Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-400">{Math.floor(learningProgress.timeSpent / 60)}m</div>
                      <div className="text-xs text-dark-400">Time Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Quiz Mode */
            <div className="p-6">
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Knowledge Assessment</h3>
                
                <div className="mb-6">
                  <p className="text-dark-300 mb-4 text-lg">{currentQuiz.question}</p>
                  
                  <div className="space-y-3">
                    {currentQuiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedAnswer === option
                            ? 'bg-primary-600 border-primary-500 text-white'
                            : 'bg-dark-700 border-dark-600 text-dark-300 hover:bg-dark-600'
                        } ${showResult && option === currentQuiz.correct ? 'bg-success-600 border-success-500' : ''}
                        ${showResult && selectedAnswer === option && option !== currentQuiz.correct ? 'bg-error-600 border-error-500' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedAnswer === option ? 'border-white bg-white' : 'border-dark-400'
                          }`}></div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {!showResult ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!selectedAnswer}
                    className="px-6 py-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                      selectedAnswer === currentQuiz.correct 
                        ? 'bg-success-500/10 border border-success-500/20 text-success-400'
                        : 'bg-error-500/10 border border-error-500/20 text-error-400'
                    }`}>
                      {selectedAnswer === currentQuiz.correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {selectedAnswer === currentQuiz.correct ? 'Correct!' : `Incorrect. The correct answer is: ${currentQuiz.correct}`}
                        </p>
                        <p className="text-sm mt-1 opacity-90">{currentQuiz.explanation}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={resetQuiz}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* AI Learning Analytics - 40% width */}
        <div className="w-2/5 overflow-y-auto p-6">
          <SmartDataAnalyzer 
            data={learningData}
            context="learning"
            autoRefresh={false}
          />
        </div>
      </div>
    </div>
  );
};