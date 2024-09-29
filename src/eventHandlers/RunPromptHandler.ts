import * as vscode from "vscode";
import BaseEventHandler from "./BaseEventHandler";
import { AIRole, WebViewMessage } from "../types";
import { MAX_FILE_SIZE } from "../const";
import AIProvider from "../AI/AIProvider";
import { getCurrentFile } from "../editor.utils";

class RunPromptHandler extends BaseEventHandler {
  async handle(request: WebViewMessage): Promise<void> {
    const { message } = request;
    if (!message) {
      return;
    }
    this.sendMessage({ type: "SET_LOADING", message: true });
    await this.createAIMessage(message);
    this.sendMessage({ type: "SET_LOADING", message: false });
  }

  private async prepareInput(input: string) {
    if (!input) {
      return;
    }
    const FILE_KEY = "@file";
    const hasDocReference = input.includes(FILE_KEY);
    if (!hasDocReference) {
      return input;
    }
    let currentDoc = getCurrentFile();
    if (!currentDoc) {
      return input;
    }
    if (currentDoc.lineCount > MAX_FILE_SIZE) {
      this.showError(`File is longer then ${MAX_FILE_SIZE} lines`);
      return input;
    }

    const fileName = currentDoc.fileName;
    const content = currentDoc.getText();
    const delimiter = `\n\n'''\n\n`;

    return input.replace(
      FILE_KEY,
      `File: ${fileName}:` + "\n" + `${delimiter}${content}${delimiter}`
    );
  }

  private async createAIMessage(message: string) {
    const input = await this.prepareInput(message || "");
    if (!input) {
      return;
    }

    const aiProvider = new AIProvider();

    const response = await aiProvider.createAIMessage([
      // TODO move to settings
      {
        role: AIRole.SYSTEM,
        content: `You are coding assistant.
        Follow these steps:
        1. Explain what user asked
        2. Divide question into several steps
        3. Answer user request step by step
        4. Validate the response, make sure it is correct.
        5. Keep respons short

        Always respond with valid MD document. Annotate code blocks with language`,
      },
      {
        role: AIRole.USER,
        content: input,
      },
    ]);

    if (!response.success) {
      return this.showError(response.error || "Error");
    }

    this.sendMessage({
      type: "ADD_MESSAGE",
      message: { role: "user", content: message },
    });
    this.sendMessage({
      type: "ADD_MESSAGE",
      message: { role: "assistant", content: response.data },
    });

    this.showInfo(`Responded: ${response.data}`);
  }
}

export default RunPromptHandler;
