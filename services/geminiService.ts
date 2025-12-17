import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { PersonaConfig } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export class GeminiService {
  private client: GoogleGenAI;
  private chatSession: Chat | null = null;
  private currentConfig: PersonaConfig | null = null;

  constructor() {
    this.client = getClient();
  }

  /**
   * Initializes a new chat session with the specific persona configuration.
   */
  public initializeChat(config: PersonaConfig) {
    this.currentConfig = config;
    
    // Determine strict model name based on user selection or defaults
    const modelName = config.model || 'gemini-2.5-flash';

    const sessionConfig: any = {
      systemInstruction: config.systemInstruction,
    };

    // Add thinking config if budget is set and > 0
    if (config.thinkingBudget > 0) {
      sessionConfig.thinkingConfig = {
        thinkingBudget: config.thinkingBudget
      };
    }

    this.chatSession = this.client.chats.create({
      model: modelName,
      config: sessionConfig,
    });
  }

  /**
   * Sends a message to the current chat session and yields chunks of the response.
   */
  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized.");
    }

    try {
      const result = await this.chatSession.sendMessageStream({
        message: message,
      });

      for await (const chunk of result) {
        // According to the new SDK, accessing .text property directly
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error in sendMessageStream:", error);
      throw error;
    }
  }

  public reset() {
    this.chatSession = null;
    this.currentConfig = null;
  }
}

export const geminiService = new GeminiService();