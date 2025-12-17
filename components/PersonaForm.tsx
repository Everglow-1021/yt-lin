import React, { useState, useEffect } from 'react';
import { PersonaConfig, DEFAULT_PERSONA } from '../types';

interface PersonaFormProps {
  initialConfig?: PersonaConfig;
  onStartChat: (config: PersonaConfig) => void;
}

const PersonaForm: React.FC<PersonaFormProps> = ({ initialConfig, onStartChat }) => {
  const [config, setConfig] = useState<PersonaConfig>(initialConfig || DEFAULT_PERSONA);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartChat(config);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-2xl overflow-hidden max-w-2xl mx-auto border border-slate-200">
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">角色设定 (Persona Setup)</h2>
        <p className="text-brand-100 opacity-90">定义 Agent 的性格、说话方式和思维模式。</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar and Name */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-slate-700 mb-1">头像 (Emoji)</label>
              <input
                type="text"
                value={config.avatarEmoji}
                onChange={(e) => setConfig({ ...config, avatarEmoji: e.target.value })}
                className="w-16 h-14 text-center text-3xl border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">角色名称 (Name)</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="例如：福尔摩斯"
                required
              />
            </div>
          </div>

          {/* System Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              角色指令 & 思考方式 (System Instructions)
              <span className="ml-2 text-xs text-slate-500 font-normal">最核心的设置，决定了AI的表现。</span>
            </label>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition h-64 text-sm leading-relaxed"
              placeholder="你是一个... 你的说话风格是... 当遇到问题时，你应该..."
              required
            />
          </div>

          {/* Advanced Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center text-brand-600 hover:text-brand-800 text-sm font-medium focus:outline-none"
            >
              <i className={`fas fa-chevron-${isAdvancedOpen ? 'down' : 'right'} mr-2`}></i>
              高级设置 (Advanced Settings)
            </button>

            {isAdvancedOpen && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">模型 (Model)</label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (快速/通用)</option>
                    <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (强推理)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    思考预算 Tokens (Thinking Budget)
                    <span className="ml-2 text-xs text-slate-500">仅 Gemini 2.5 系列支持。设置为0禁用。</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="16000"
                      step="1024"
                      value={config.thinkingBudget}
                      onChange={(e) => setConfig({ ...config, thinkingBudget: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <span className="w-16 text-right font-mono text-sm">{config.thinkingBudget}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    增加思考预算可以让模型在回答前进行更深度的逻辑推理。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fas fa-comments"></i>
              开始对话 (Start Chat)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonaForm;