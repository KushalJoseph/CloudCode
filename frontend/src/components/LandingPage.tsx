import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type CloudProvider = 'AWS' | 'GCP' | 'Azure' | null;

export const LandingPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(null);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [text, setText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Idle, 1: Process, 2: Generate, 3: Diagram, 4: Done
  const navigate = useNavigate();

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
    { value: 'AWS', label: 'Amazon Web Services', icon: '☁️', color: 'from-orange-500 to-yellow-500' },
    { value: 'GCP', label: 'Google Cloud Platform', icon: '🌐', color: 'from-blue-500 to-green-500' },
    { value: 'Azure', label: 'Microsoft Azure', icon: '⚡', color: 'from-blue-600 to-cyan-500' },
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

      // Redirect
      navigate('/designer', {
        state: {
          initialMessage: message,
          cloudProvider: selectedProvider,
          nodes: response.diagram.nodes,
          edges: response.diagram.edges,
          terraformCode: response.terraform,
          refinedPrompt: response.refined_prompt,
        },
      });

    } catch (error) {
      console.error('Failed to generate infrastructure:', error);
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Typewriter Header */}
      <div className={`transition-all duration-1000 ease-in-out z-10 ${showContent ? 'mb-12 scale-75' : 'mb-0 scale-100'}`}>
        <h1 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent h-20">
          {text}<span className="animate-pulse">|</span>
        </h1>
      </div>

      {/* Main Interface */}
      {showContent && (
        <div className="w-full max-w-4xl z-10 animate-fade-in-up">

          {loadingStep === 0 ? (
            /* Chat Interface */
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl relative">
              <div className="relative bg-slate-950/50 rounded-[22px] overflow-hidden">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your cloud architecture..."
                  className="w-full h-48 p-6 text-xl bg-transparent text-white placeholder-white/20 focus:outline-none resize-none"
                />

                {/* Bottom Bar with Provider Selector and Send */}
                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${selectedProvider ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                    >
                      {selectedProvider ? (
                        <>
                          <span>{providers.find(p => p.value === selectedProvider)?.icon}</span>
                          <span className="font-medium">{selectedProvider}</span>
                        </>
                      ) : (
                        <span className="text-sm">Select Provider</span>
                      )}
                      <span className="text-xs">▼</span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20">
                        {providers.map((provider) => (
                          <button
                            key={provider.value}
                            onClick={() => {
                              setSelectedProvider(provider.value);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors"
                          >
                            <span className="text-xl">{provider.icon}</span>
                            <span className="text-white text-sm">{provider.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || !selectedProvider}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${message.trim() && selectedProvider
                        ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                        : 'bg-white/10 text-white/20 cursor-not-allowed'
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
                        ? 'bg-slate-900/80 border-white/10 translate-x-0 opacity-100'
                        : 'bg-transparent border-transparent -translate-x-4 opacity-30'
                      }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-lg font-medium transition-colors ${isActive || isCompleted ? 'text-white' : 'text-white/40'}`}>
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
