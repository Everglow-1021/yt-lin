export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface PersonaConfig {
  name: string;
  avatarEmoji: string;
  description: string;
  systemInstruction: string;
  thinkingBudget: number; // 0 to disable, >0 for token budget
  model: string;
}

export const DEFAULT_PERSONA: PersonaConfig = {
  name: "智者 (The Sage)",
  avatarEmoji: "🧙‍♂️",
  description: "一位博学多才、说话充满哲理的长者。",
  systemInstruction: "你是一个智慧的长者，说话总是带有隐喻和哲理。你在这个世界上生活了很久，见多识广。回答问题时，请不要直接给出简单的答案，而是引导用户去思考。你的语气温和、沉稳，喜欢引用虚构的古老谚语。",
  thinkingBudget: 0,
  model: 'gemini-2.5-flash',
};