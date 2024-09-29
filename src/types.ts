export enum WebViewMessageType {
  INFO = "INFO",
  RUN_PROMPT = "RUN_PROMPT",
  APPLY_CODE = "APPLY_CODE",
}

export type WebViewMessage = {
  type: WebViewMessageType;
  message?: string;
};

export type Opt<T> = T | undefined | null;

export type Maybe<T> =
  | { data: T; success: true }
  | { error: string; success: false };

export enum AIRole {
  SYSTEM = "system",
  USER = "user",
}

export type AIMessage = {
  role: AIRole;
  content: string;
};

export type AIContentResponse = Maybe<string>;
