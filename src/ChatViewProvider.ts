import * as vscode from "vscode";
import { Opt } from "./types";
import GcoderChatViewInstance from "./ViewInstance";

class GcoderChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "gcoderChatView";
  private readonly _extensionUri: vscode.Uri;
  private _viewInstance: Opt<GcoderChatViewInstance>;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
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
    const htmlUri = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      htmlFilePath
    );
    const bytes = await vscode.workspace.fs.readFile(htmlUri);
    let html = new TextDecoder("utf-8").decode(bytes);

    const resourceFilesSet = new Set(resourceFiles);

    // Regex to match <script> and <link rel="stylesheet"> tags
    const resourceTagRegex =
      /<(script|link)([^>]*?)(src|href)="([^"]+)"[^>]*?(?:><\/script>|\/>)/g;

    html = html.replace(
      resourceTagRegex,
      (match, tagName, attributes, srcOrHref, url) => {
        if (resourceFilesSet.has(url)) {
          const resourceUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", url)
          );

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
