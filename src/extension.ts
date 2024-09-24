import * as vscode from "vscode";
import GcoderChatViewProvider from "./ChatViewProvider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new GcoderChatViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      GcoderChatViewProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  let disposable = vscode.commands.registerCommand("gcoder.openChat", () => {
    vscode.commands.executeCommand("workbench.view.extension.gcoder");
  });

  context.subscriptions.push(disposable);
}

// TODO do something here?
export function deactivate() {
  console.log('Extension "gcoder" is now deactivated.');
}
