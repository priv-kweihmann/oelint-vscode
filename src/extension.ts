import * as vscode from 'vscode';
import Linter, { LinterError } from './linter';

async function doLint(codeDocument: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> {
  const linter = new Linter(codeDocument);
  const errors: LinterError[] = await linter.lint();

  const uniqueFiles: string[] = errors.map(f => { return f.proto.file });

  collection.clear();
  uniqueFiles.forEach(file => {
    const ferrors = errors.filter(error => {
      return error.proto.file == file;
    });
    const diagnostics = ferrors.map(error => {
      return new vscode.Diagnostic(error.range, error.proto.reason, error.proto.severity);
    });

    vscode.workspace.textDocuments.forEach(t => {
      if (t.fileName == file) {
        collection.set(t.uri, diagnostics);
      }
    })
  });
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = 'extension.oelint';
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(commandId);

  let events = vscode.commands.registerCommand(commandId, () => {
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      if(document.languageId !== 'bitbake') {
        return;
      }

      doLint(document, diagnosticCollection);
    });
  });

  vscode.commands.executeCommand(commandId);
  context.subscriptions.push(events);
}
