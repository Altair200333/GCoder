export enum WebViewMessageType {
  INFO = "INFO",
  RUN_PROMPT = "RUN_PROMPT",
}

export type WebViewMessage = {
  type: WebViewMessageType;
  message?: string;
};

export type Opt<T> = T | undefined | null;

export enum AIRole {
  SYSTEM = "system",
  USER = "user",
}

export type AIMessage = {
  role: AIRole;
  content: string;
};

export type AIContentResponse = {
  success: boolean;
  error?: string;
  content?: string;
};
