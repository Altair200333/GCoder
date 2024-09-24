import * as vscode from "vscode";

abstract class WebViewProvider {
  constructor(protected webviewView: vscode.WebviewView) {}

  protected async sendMessage(message: unknown) {
    await this.webviewView.webview.postMessage(message);
  }

  protected showInfo(message: string) {
    vscode.window.showInformationMessage(message);
  }

  protected showError(message: string) {
    vscode.window.showErrorMessage(message);
  }
}

export default WebViewProvider;
