import * as vscode from "vscode";
import BaseEventHandler from "./BaseEventHandler";
import { AIRole, Maybe, WebViewMessage } from "../types";
import { CODE_BLOCK, MAX_FILE_SIZE } from "../const";
import AIProvider from "../AI/AIProvider";
import { getCurrentFile, replaceEditorText } from "../editor.utils";
import { extractFromCodeBlock } from "../utils";

const MODEL = "gpt-4o";

type ApplyCodeMessage = WebViewMessage & {
  data: { codeBlockId: string; code: string };
};

class ApplyCodeHandler extends BaseEventHandler {
  async handle(request: ApplyCodeMessage): Promise<void> {
    const { data } = request;
    if (!data) {
      return;
    }

    const { codeBlockId, code } = data;

    this.sendMessage({
      type: "SET_APPLY_LOADING",
      message: { isLoading: true, codeBlockId },
    });

    await this.applyCode(code);

    this.sendMessage({
      type: "SET_APPLY_LOADING",
      message: { isLoading: false, codeBlockId },
    });

    this.showInfo("Applied code!");
  }

  private async applyCode(message: string) {
    const aiProvider = new AIProvider();

    const fileContentData = await this.getCurrentFile();
    if (!fileContentData.success) {
      this.showError(fileContentData.error);
      return undefined;
    }

    const fileContent = fileContentData.data;
    const response = await aiProvider.createAIMessage(
      [
        {
          role: AIRole.SYSTEM,
          content: `You are code editor, apply the code changes to the code itself. 
          You return resulting code in formatted code block: ${CODE_BLOCK}
          Format changes as github conflic resolutions block:
          ${CODE_BLOCK}
          <<<<<<<
          OLD
          =======
          NEW
          >>>>>>>
          ${CODE_BLOCK}
          `,
        },
        {
          role: AIRole.USER,
          content: `This is ORIGINAL code:
          ${CODE_BLOCK}
          ${fileContent}
          ${CODE_BLOCK}
          
          Apply this change:
          ${CODE_BLOCK}
          ${message}
          ${CODE_BLOCK}
          
          Write FINAL CODE:`,
        },
      ],
      { model: MODEL }
    );

    if (!response.success) {
      return this.showError(response.error);
    }

    const cleanCode = extractFromCodeBlock(response.data);
    await replaceEditorText(cleanCode);
  }

  private async getCurrentFile(): Promise<Maybe<string>> {
    let currentDoc = getCurrentFile();
    if (!currentDoc) {
      return { success: false, error: "There is no active doc" };
    }
    if (currentDoc.lineCount > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Can not apply code, file is longer then ${MAX_FILE_SIZE} lines`,
      };
    }

    const content = currentDoc.getText();
    return { success: true, data: content };
  }
}

export default ApplyCodeHandler;
