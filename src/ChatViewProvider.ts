import * as vscode from "vscode";
import { Opt } from "./types";
import GcoderChatViewInstance from "./ViewInstance";
import FileManager from "./FileManager";

class GcoderChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gcoderChatView";
  private readonly _extensionUri: vscode.Uri;
  private _viewInstance: Opt<GcoderChatViewInstance>;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
    FileManager.setUri(this._extensionUri);
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = await this.getHtmlForWebview(
      webviewView.webview
    );

    this._viewInstance = new GcoderChatViewInstance(webviewView);
  }

  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const pageContent = await this.getWebviewContent(webview, "panel.html", [
      "panel.js",
      "style.css",
    ]);
    return pageContent;
  }

  async getWebviewContent(
    webview: vscode.Webview,
    htmlFilePath: string,
    resourceFiles: string[]
  ): Promise<string> {
    const htmlResponse = await FileManager.readFile(`media/${htmlFilePath}`);
    if (!htmlResponse.success) {
      return `<div>Failed to load file ${htmlResponse.error}</div>`;
    }

    let html = htmlResponse.data;

    const resourceFilesSet = new Set(resourceFiles);

    // Regex to match <script> and <link rel="stylesheet"> tags
    const resourceTagRegex =
      /<(script|link)([^>]*?)(src|href)="([^"]+)"[^>]*?(?:><\/script>|\/>)/g;

    html = html.replace(
      resourceTagRegex,
      (match, tagName, attributes, srcOrHref, url) => {
        if (resourceFilesSet.has(url)) {
          const fileUriResponse = FileManager.getUri(`media/${url}`);
          if (!fileUriResponse.success) {
            return match;
          }
          const resourceUri = webview.asWebviewUri(fileUriResponse.data);

          // Reconstruct the tag with the updated resource URI
          if (tagName === "script") {
            return `<script${attributes}${srcOrHref}="${resourceUri}"></script>`;
          } else if (tagName === "link") {
            return `<link${attributes}${srcOrHref}="${resourceUri}" />`;
          }
        }
        return match;
      }
    );

    return html;
  }
}

export default GcoderChatViewProvider;
