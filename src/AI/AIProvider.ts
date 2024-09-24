import * as vscode from "vscode";
import OpenAI from "openai";
import { AIContentResponse, AIMessage } from "../types";

const DEFAULT_MODEL = "gpt-4o";

class AIProvider {
  async createAIMessage(
    messages: AIMessage[],
    params?: { model?: string }
  ): Promise<AIContentResponse> {
    const { model = DEFAULT_MODEL } = params || {};
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: "Please configue OpenAI api key in settings",
      };
    }
    const openai = new OpenAI({ apiKey });

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
      });
      const response = completion.choices?.at(0)?.message?.content;
      if (!response) {
        return { success: false, error: "Failed to generate respnse" };
      }
      return { success: true, content: response };
    } catch (err) {
      const message = (err as any)?.message;
      return { success: false, error: message || "Failed to create message" };
    }
  }

  private getApiKey(): string | undefined {
    const config = vscode.workspace.getConfiguration("gcoder");
    return config.get("apiKey");
  }
}

export default AIProvider;
