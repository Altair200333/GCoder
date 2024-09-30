import * as vscode from "vscode";
import { Maybe, Opt } from "./types";

class FileManager {
  private static instance: FileManager;
  private _extensionUri: Opt<vscode.Uri>;

  private constructor() {}

  private static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  public static setUri(uri: vscode.Uri) {
    const instance = FileManager.getInstance();
    instance._extensionUri = uri;
  }

  public static async readFile(filePath: string): Promise<Maybe<string>> {
    const instance = FileManager.getInstance();
    if (!instance._extensionUri) {
      return { success: false, error: "Extension URI not set" };
    }

    const fileUri = vscode.Uri.joinPath(instance._extensionUri, filePath);
    const bytes = await vscode.workspace.fs.readFile(fileUri);
    const text = new TextDecoder("utf-8").decode(bytes);

    return { success: true, data: text };
  }

  public static getUri(filePath: string): Maybe<vscode.Uri> {
    const instance = FileManager.getInstance();
    if (!instance._extensionUri) {
      return { success: false, error: "Extension URI not set" };
    }
    const uri = vscode.Uri.joinPath(instance._extensionUri, filePath);
    return { success: true, data: uri };
  }

  public static getPath(filePath: string): Maybe<string> {
    const response = this.getUri(filePath);
    if (!response.success) {
      return response;
    }
    return { success: true, data: response.data.path };
  }
}

export default FileManager;
