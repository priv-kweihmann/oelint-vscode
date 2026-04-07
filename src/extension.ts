import * as cp from 'child_process';
import * as util from 'util';
import * as vscode from 'vscode';
import Linter, { LinterError } from './linter';

async function doLint(
  codeDocument: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
  output: vscode.OutputChannel
): Promise<void> {
  const linter = new Linter(codeDocument, output);
  const errors: LinterError[] = await linter.lint();
  output.appendLine(`Parsed errors: ${errors.length}`);

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

async function doUpdate(): Promise<void> {
  Linter.update();
}

async function logOelintVersion(output: vscode.OutputChannel): Promise<void> {
  const exec = util.promisify(cp.exec);
  await exec("oelint-adv --version")
    .then((result: { stdout: string }) => output.appendLine(`oelint-adv version: ${result.stdout.trim()}`))
    .catch(() => output.appendLine("oelint-adv version: unknown"));
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = 'extension.oelint';
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(commandId);
  const output = vscode.window.createOutputChannel('oelint-adv');
  output.appendLine('oelint-adv extension activated');
  logOelintVersion(output);

  const saveListener = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if (document.languageId !== 'bitbake') {
      return;
    }

    output.appendLine(`Linting on save: ${document.uri.fsPath}`);
    void doLint(document, diagnosticCollection, output);
  });

  context.subscriptions.push(saveListener);
  context.subscriptions.push(output);
  context.subscriptions.push(diagnosticCollection);

  // do auto update
  doUpdate();
}
