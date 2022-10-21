import * as vscode from "vscode";
import * as fs from "fs";
import * as Encoding from "encoding-japanese";
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "mojibake-hunter" is now active!'
  );
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((event) => {
      event.uri.scheme === "file" && handlerOnOpenRefreshModification(event);
    })
  );
}

export function deactivate() {}

async function handlerOnOpenRefreshModification(
  textDocument: vscode.TextDocument
) {
  const maxLine =
    vscode.workspace.getConfiguration("mojibake").get<number>("MaxLines") ||
    1000;
  if (textDocument.lineCount > maxLine) {
    modalDialogShow(
      `"${path.basename(
        textDocument.uri.fsPath
      )}" lines is over ${maxLine} : does not check mojibake`
    );
    return;
  }

  // get vscode text on unicode
  const docText = textDocument.getText();

  // get file text on unicode
  const text = fs.readFileSync(textDocument.uri.fsPath);
  const docFile = Encoding.convert(text, {
    to: "UNICODE",
    type: "string",
  });

  const textEq = docText === docFile;
  !textEq &&
    modalDialogShow(
      `May be mojibake::  ${path.basename(textDocument.uri.fsPath)}`
    );
}

async function modalDialogShow(message: string) {
  await vscode.window.showWarningMessage(
    message,
    { modal: true },
    { title: "Ok", isCloseAffordance: true }
  );
}
