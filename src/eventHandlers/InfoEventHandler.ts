import * as vscode from "vscode";
import { WebViewMessage } from "../types";
import BaseEventHandler from "./BaseEventHandler";

class InfoEventHandler extends BaseEventHandler {
  async handle(message: WebViewMessage): Promise<void> {
    this.showInfo(`You said: ${message.message}`);
  }
}

export default InfoEventHandler;