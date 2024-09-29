import * as vscode from "vscode";
import { WebViewMessage, WebViewMessageType } from "./types";
import BaseEventHandler from "./eventHandlers/BaseEventHandler";
import InfoEventHandler from "./eventHandlers/InfoEventHandler";
import RunPromptHandler from "./eventHandlers/RunPromptHandler";
import WebViewProvider from "./WebViewProvider";
import ApplyCodeHandler from "./eventHandlers/ApplyCodeHandler";

class GcoderChatViewInstance extends WebViewProvider {
  private messageHandlers: Partial<
    Record<WebViewMessageType, BaseEventHandler>
  > = {};

  constructor(webviewView: vscode.WebviewView) {
    super(webviewView);
    this.registerEventListener();
    this.registerMessageHandlers();
  }

  private registerMessageHandlers() {
    this.messageHandlers = {
      [WebViewMessageType.INFO]: new InfoEventHandler(this.webviewView),
      [WebViewMessageType.RUN_PROMPT]: new RunPromptHandler(this.webviewView),
      [WebViewMessageType.APPLY_CODE]: new ApplyCodeHandler(this.webviewView),
    };
  }

  private registerEventListener() {
    this.webviewView.webview.onDidReceiveMessage(this.onMessageReceived);
  }

  private onMessageReceived = async (message: WebViewMessage) => {
    const handler = this.messageHandlers[message.type];
    if (!handler) {
      return this.showError(`Unknown message received ${message.type}`);
    }
    try {
      await handler.handle(message);
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to handle message ${err}`);
    }
  };

  // clenaup if necessary
  dispose() {}
}

export default GcoderChatViewInstance;
