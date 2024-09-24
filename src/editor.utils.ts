import * as vscode from "vscode";
import { makeDeferred } from "./utils";

export const getCurrentFile = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  return editor.document;
};

export const replaceEditorText = async (
  replacement: string
): Promise<boolean> => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  const document = editor.document;

  const deferred = makeDeferred<boolean>();

  editor
    .edit((editBuilder) => {
      const startPosition = new vscode.Position(0, 0);
      const lastLine = document.lineCount - 1;
      const endPosition = document.lineAt(lastLine).range.end;
      const entireRange = new vscode.Range(startPosition, endPosition);

      editBuilder.replace(entireRange, replacement);
    })
    .then((success) => deferred.resolve(success));

  return deferred.promise;
};
