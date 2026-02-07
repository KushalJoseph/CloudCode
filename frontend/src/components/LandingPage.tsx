import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CloudProvider = 'AWS' | 'GCP' | 'Azure' | null;

export const LandingPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(null);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const providers: Array<{ value: CloudProvider; label: string; icon: string; color: string }> = [
    { value: 'AWS', label: 'Amazon Web Services', icon: '☁️', color: 'from-orange-500 to-yellow-500' },
    { value: 'GCP', label: 'Google Cloud Platform', icon: '🌐', color: 'from-blue-500 to-green-500' },
    { value: 'Azure', label: 'Microsoft Azure', icon: '⚡', color: 'from-blue-600 to-cyan-500' },
  ];

  const handleSend = () => {
    if (!message.trim() || !selectedProvider) return;

    navigate('/designer', {
      state: {
        initialMessage: message,
        cloudProvider: selectedProvider,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl animate-fade-in-up">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">⚡</span>
            <h1 className="text-4xl font-bold gradient-text">CloudCode</h1>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="glass-strong rounded-2xl p-8 space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">Welcome to CloudCode</h2>
            <p className="text-xl text-white/70">What can I help with?</p>
          </div>

          {/* Cloud Provider Dropdown */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">
              Please select your Cloud Provider
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-white/20 rounded-lg text-white text-left flex items-center justify-between hover:border-white/40 transition-all duration-200 hover:bg-slate-800"
              >
                <span className="flex items-center gap-2">
                  {selectedProvider ? (
                    <>
                      <span className="text-lg">
                        {providers.find(p => p.value === selectedProvider)?.icon}
                      </span>
                      <span className="font-medium text-sm">
                        {providers.find(p => p.value === selectedProvider)?.value}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/50 text-sm">Select a provider...</span>
                  )}
                </span>
                <span className={`transform transition-transform text-xs ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-lg overflow-hidden border border-white/20 z-20">
                  {providers.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() => {
                        setSelectedProvider(provider.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 transition-all duration-200 ${selectedProvider === provider.value ? 'bg-white/5' : ''
                        }`}
                    >
                      <span className="text-lg">{provider.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{provider.value}</div>
                      </div>
                      {selectedProvider === provider.value && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Input - Clean ChatGPT Style */}
          <div className="space-y-3">
            <div className={`flex items-end gap-3 ${!selectedProvider ? 'opacity-50' : ''}`}>
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedProvider}
                  rows={1}
                  placeholder={
                    selectedProvider
                      ? "Message CloudCode"
                      : "Select a cloud provider first..."
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-slate-800/80 disabled:cursor-not-allowed transition-all duration-200 resize-none max-h-32 overflow-y-auto"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || !selectedProvider}
                className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 disabled:opacity-30 flex-shrink-0"
                title="Send message"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
            {selectedProvider && (
              <p className="text-xs text-white/40 text-center animate-fade-in-up">
                CloudCode can make mistakes. Check important info.
              </p>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-8 text-white/40 text-sm">
          Powered by AI • Infrastructure as Code
        </div>
      </div>
    </div>
  );
};
