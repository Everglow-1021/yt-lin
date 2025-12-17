import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, PersonaConfig } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  config: PersonaConfig;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message from the system (local only)
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: Role.MODEL,
        content: `你好，我是${config.name}。${config.description ? config.description : ''} 让我们开始交谈吧。`,
        timestamp: Date.now(),
      },
    ]);
  }, [config]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const stream = geminiService.sendMessageStream(userMessage.content);
      
      const modelMessageId = (Date.now() + 1).toString();
      let accumulatedContent = '';

      // Initialize placeholder message for the model
      setMessages((prev) => [
        ...prev,
        {
          id: modelMessageId,
          role: Role.MODEL,
          content: '', // Empty initially
          timestamp: Date.now(),
          isStreaming: true,
        },
      ]);

      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }
      
      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.SYSTEM,
          content: "Sorry, I encountered an error connecting to the character. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      // Keep focus on input for rapid chatting
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition"
            title="Return to Config"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="avatar">{config.avatarEmoji}</span>
            <div>
              <h3 className="font-bold text-slate-800">{config.name}</h3>
              <div className="text-xs text-brand-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Model: {config.model}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg) => {
          const isUser = msg.role === Role.USER;
          const isSystem = msg.role === Role.SYSTEM;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full border border-red-100">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[75%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${
                  isUser ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  {isUser ? <i className="fas fa-user"></i> : config.avatarEmoji}
                </div>

                {/* Bubble */}
                <div
                  className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                  {msg.isStreaming && (
                     <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-brand-400 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${config.name}...`}
            className="flex-1 py-3 pl-4 pr-12 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none text-slate-800 placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 p-2 rounded-lg transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                : 'bg-transparent text-slate-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </form>
        <div className="text-center mt-2">
           <span className="text-[10px] text-slate-400">
             AI mimics {config.name}. Mistakes are possible.
           </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;