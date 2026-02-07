import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ThemeToggle } from './ThemeToggle';
import { LoginButton } from './LoginButton';

import googleLogo from '../assets/google_logo.svg';
import azureLogo from '../assets/azure_logo.svg';
import awsLogo from '../assets/aws_logo.png';

type CloudProvider = 'AWS' | 'GCP' | 'Azure' | null;

export const LandingPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(null);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [text, setText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Idle, 1: Process, 2: Generate, 3: Diagram, 4: Done
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 56; // ~1 line
      const maxHeight = 200; // ~5 lines max before scroll
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [message]);

  const fullText = "Welcome to CloudCode";

  // Typewriter effect
  useState(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setTimeout(() => setShowContent(true), 500);
      }
    }, 100);
    return () => clearInterval(intervalId);
  });

  const providers: Array<{ value: CloudProvider; label: string; icon: string; color: string }> = [
    { value: 'AWS', label: 'Amazon Web Services', icon: awsLogo, color: 'from-orange-500 to-yellow-500' },
    { value: 'GCP', label: 'Google Cloud Platform', icon: googleLogo, color: 'from-blue-500 to-green-500' },
    { value: 'Azure', label: 'Microsoft Azure', icon: azureLogo, color: 'from-blue-600 to-cyan-500' },
  ];

  const steps = [
    { id: 1, text: "Refining Prompt" },
    { id: 2, text: "Generating Terraform Configuration" },
    { id: 3, text: "Crafting Architecture Diagram" }
  ];

  const handleSend = async () => {
    if (!message.trim() || !selectedProvider || loadingStep > 0) return;

    // Start Loading Sequence
    setLoadingStep(1); // Step 1: Refining Prompt

    try {
      // Initiate API call in background
      const apiCall = api.generateInfrastructure(message, selectedProvider.toLowerCase());

      // Sequence Delays (5s each)
      await new Promise(resolve => setTimeout(resolve, 5000));
      setLoadingStep(2); // Step 2: Generating Terraform

      await new Promise(resolve => setTimeout(resolve, 5000));
      setLoadingStep(3); // Step 3: Crafting Diagram

      await new Promise(resolve => setTimeout(resolve, 5000));
      setLoadingStep(4); // All Done

      // Wait for API if it's still running (unlikely after 15s but possible)
      const response = await apiCall;

      // Create Project in Backend
      const newProject = await api.projects.create({
        title: 'Untitled Project',
        provider: selectedProvider,
        diagram: response.diagram,
        terraform: response.terraform,
        chat_history: [
          { role: 'user', content: message },
          { role: 'assistant', content: response.refined_prompt || "Here is your generated architecture." }
        ]
      });

      // Redirect to new project
      navigate(`/designer/${newProject.id}`, {
        state: {
          initialMessage: message,
          cloudProvider: selectedProvider,
          nodes: response.diagram.nodes,
          edges: response.diagram.edges,
          terraformCode: response.terraform,
          refinedPrompt: response.refined_prompt,
          chatHistory: newProject.chat_history // Pass the initialized history
        },
      });

    } catch (error) {
      console.error('Failed to generate or save project:', error);
      setLoadingStep(0); // Reset on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Typewriter Header */}
      <div className={`transition-all duration-1000 ease-in-out z-10 ${showContent ? 'mb-12 scale-75' : 'mb-0 scale-100'}`}>
        <h1 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-white dark:to-white/70 bg-clip-text text-transparent h-20">
          {text}<span className="animate-pulse text-slate-900 dark:text-white">|</span>
        </h1>
      </div>

      {/* Main Interface */}
      {showContent && (
        <div className="w-full max-w-4xl z-10 animate-fade-in-up">

          {loadingStep === 0 ? (
            /* Chat Interface */
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-1 shadow-2xl relative transition-colors duration-300">
              <div className="relative bg-white/50 dark:bg-slate-950/50 rounded-[22px] transition-colors duration-300">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your cloud architecture..."
                  rows={1}
                  className="w-full min-h-[56px] max-h-[200px] p-6 pb-20 text-xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none resize-none overflow-y-auto transition-colors duration-300"
                />

                {/* Bottom Bar with Provider Selector and Send */}
                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center z-10">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${selectedProvider
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border-slate-200 dark:border-transparent'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/10 border-transparent'
                        }`}
                    >
                      {selectedProvider ? (
                        <>
                          <span>
                            <img src={providers.find(p => p.value === selectedProvider)?.icon} alt={selectedProvider} className="w-5 h-5 object-contain" />
                          </span>
                          <span className="font-medium">{selectedProvider}</span>
                        </>
                      ) : (
                        <span className="text-sm">Select Provider</span>
                      )}
                      <span className="text-xs">▼</span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
                        {providers.map((provider) => (
                          <button
                            key={provider.value}
                            onClick={() => {
                              setSelectedProvider(provider.value);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-1.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          >
                            <span className="text-lg">
                              <img src={provider.icon} alt={provider.label} className="w-6 h-6 object-contain" />
                            </span>
                            <span className="text-slate-700 dark:text-white text-sm">{provider.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || !selectedProvider}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${message.trim() && selectedProvider
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/20 cursor-not-allowed'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Loading Sequence */
            <div className="max-w-xl mx-auto space-y-4">
              {steps.map((step) => {
                const isActive = loadingStep === step.id;
                const isCompleted = loadingStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${isActive || isCompleted
                      ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 translate-x-0 opacity-100 shadow-lg'
                      : 'bg-transparent border-transparent -translate-x-4 opacity-30'
                      }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                          <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 border-2 border-slate-400 dark:border-white/20 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-2 h-2 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-lg font-medium transition-colors ${isActive || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <LoginButton />
          </div>
        </div>
      )}
    </div>
  );
};
