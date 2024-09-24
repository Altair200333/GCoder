import * as vscode from "vscode";
import { WebViewMessage } from "../types";
import WebViewProvider from "../WebViewProvider";

abstract class BaseEventHandler extends WebViewProvider {
  constructor(webviewView: vscode.WebviewView) {
    super(webviewView);
  }

  abstract handle(message: WebViewMessage): Promise<void>;
}

export default BaseEventHandler;
