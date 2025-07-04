import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as util from 'util';
import { OelintError, parseOelintError } from './oelintError';

export interface LinterError {
  proto: OelintError;
  range: vscode.Range;
}

export default class Linter {
  private codeDocument: vscode.TextDocument;

  constructor(document: vscode.TextDocument) {
    this.codeDocument = document;
  }

  public static update(): void {
    const config = vscode.workspace.getConfiguration();
    if (config.get("oelint-vscode.update.auto")) {
      const exec = util.promisify(cp.exec);
      let cmd: Array<string> = ["pip3", "install", "--upgrade"];
      if (config.get("oelint-vscode.update.user")) {
        cmd.push("--user")
      }
      cmd.push("oelint-adv")
      exec(cmd.join(" "));
    }
  }

  public async lint(): Promise<LinterError[]> {
    const errors = await this.runProtoLint();
    if (!errors) {
      return [];
    }

    const lintingErrors: LinterError[] = this.parseErrors(errors);
    return lintingErrors;
  }

  private parseErrors(errorStr: string): LinterError[] {
    let errors = errorStr.split('\n') || [];

    var result = errors.reduce((errors: LinterError[], currentError: string) => {
      const parsedError = parseOelintError(currentError);
      if (!parsedError.reason) {
        return errors;
      }

      const linterError: LinterError = this.createLinterError(parsedError);
      return errors.concat(linterError);
    }, []);

    return result;
  }

  private createAdditionalConfig(): Array<string> {
    const config = vscode.workspace.getConfiguration();
    let res: Array<string> = [];
    if (config.get("oelint-vscode.run.fix")) {
      res.push("--fix");
      if (config.get("oelint-vscode.run.nobackup")) {
        res.push("--nobackup");
      }
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.extra-layer")) {
      res.push(`--extra-layer=${opt}`)
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.rules.custom")) {
      res.push(`--customrules=${opt}`)
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.rules.nonstd")) {
      res.push(`--addrules=${opt}`)
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.suppress")) {
      res.push(`--suppress=${opt}`)
    }
    if (config.get("oelint-vscode.run.mode")) {
      res.push("--mode=" + <string>(config.get("oelint-vscode.run.mode")));;
    }
    if (config.get("oelint-vscode.run.noinfo")) {
      res.push("--hide=info");
    }
    if (config.get("oelint-vscode.run.nowarn")) {
      res.push("--hide=warning");
    }
    if (config.get("oelint-vscode.run.constantfile")) {
      res.push("--constantfile=" + <string>(config.get("oelint-vscode.run.constantfile")));
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.constmodadd")) {
      res.push(`--constantmods=+${opt}`)
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.constmodrem")) {
      res.push(`--constantmods=-${opt}`)
    }
    for (var opt of <Array<string>>config.get("oelint-vscode.run.constmodovr")) {
      res.push(`--constantmods=${opt}`)
    }
    if (config.get("oelint-vscode.run.cached")) {
      res.push("--cached");
      if (config.get("oelint-vscode.run.cache-path")) {
        res.push("--cachedir=" + <string>(config.get("oelint-vscode.run.cache-path")));
      }
    }
    if (config.get("oelint-vscode.run.release")) {
      res.push("--release=" + <string>(config.get("oelint-vscode.run.release")));
    }
    return res;
  }

  private async runProtoLint(): Promise<string> {
    let wspath = process.cwd()
    if (vscode.workspace.workspaceFolders !== undefined) {
      wspath = vscode.workspace.workspaceFolders[0].uri.path;
    }
    const currentFile = this.codeDocument.uri.fsPath;
    const exec = util.promisify(cp.exec);
    const addopt = this.createAdditionalConfig().join(" ")
    const cmd = `oelint-adv ${addopt} ${currentFile}`;

    let lintResults: string = "";
    const curdir = process.cwd()

    if (curdir != wspath) {
      process.chdir(wspath)
    }
    await exec(cmd).catch((error: any) => lintResults = error.stderr);

    process.chdir(curdir)

    return lintResults;
  }

  private createLinterError(error: OelintError): LinterError {
    const linterError: LinterError = {
      proto: error,
      range: this.getErrorRange(error)
    };

    return linterError;
  }

  private getErrorRange(error: OelintError): vscode.Range {
    return this.codeDocument.lineAt(error.line - 1).range;
  }
}
