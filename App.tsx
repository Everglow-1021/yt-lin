import React, { useState } from 'react';
import { PersonaConfig } from './types';
import { geminiService } from './services/geminiService';
import PersonaForm from './components/PersonaForm';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [config, setConfig] = useState<PersonaConfig | null>(null);
  const [isChatActive, setIsChatActive] = useState(false);

  const handleStartChat = (newConfig: PersonaConfig) => {
    setConfig(newConfig);
    try {
      // Initialize the service with the user's specific system instructions and settings
      geminiService.initializeChat(newConfig);
      setIsChatActive(true);
    } catch (e) {
      alert("Failed to initialize chat. Check API Key configuration.");
      console.error(e);
    }
  };

  const handleBackToConfig = () => {
    setIsChatActive(false);
    geminiService.reset();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full h-full max-w-5xl mx-auto flex flex-col h-[90vh]">
        {/* Header Title (only show when not in chat on mobile to save space) */}
        {!isChatActive && (
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              <span className="text-brand-600">Persona</span>Chat
            </h1>
            <p className="text-slate-500 mt-2">Create custom AI agents with unique personalities</p>
          </div>
        )}

        <div className="flex-1 relative">
           {/* Transition container could go here for polish, but simple conditional rendering for now */}
          {!isChatActive ? (
            <PersonaForm 
              onStartChat={handleStartChat} 
              initialConfig={config || undefined} 
            />
          ) : (
            config && (
              <ChatInterface 
                config={config} 
                onBack={handleBackToConfig} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default App;