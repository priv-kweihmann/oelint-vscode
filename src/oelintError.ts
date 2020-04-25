import * as vscode from 'vscode';

export interface OelintError {
  file: string;
  line: number;
  reason: string;
  severity: vscode.DiagnosticSeverity;
}

export function parseOelintError(error: string): OelintError {
  if (!error) {
    return getEmptyOelintError();
  }

  const pattern = /^(.*):(\d+):((warning|error|info)):(.*?):(.*)$/;

  const match = error.match(pattern)
  if (match) {
    let _sev = vscode.DiagnosticSeverity.Hint;
    if (match[3] == "warning") _sev = vscode.DiagnosticSeverity.Warning;
    else if (match[3] == "error") _sev = vscode.DiagnosticSeverity.Error;
    else _sev = vscode.DiagnosticSeverity.Information;
    
    const oelintError: OelintError = {
      file: match[1],
      line: parseInt(match[2], 10),
      reason: `[${match[5]}] ${match[6]}`,
      severity: _sev
    };

    return oelintError;
  }

  return getEmptyOelintError();
}

export function getEmptyOelintError(): OelintError {
  const emptyOelintError: OelintError = {
    file: "",
    line: 0,
    reason: "",
    severity: vscode.DiagnosticSeverity.Hint
  };

  return emptyOelintError;
}
