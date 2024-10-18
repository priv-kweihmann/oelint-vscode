# oelint-vscode

A vscode extension to lint bitbake files.

Lot of the code actually written by [vscode-protolint](https://github.com/plexsystems/vscode-protolint) -
so 99.9% of the credit go to them

## Note

**requires** `oelint-adv` to be installed locally (run `pip3 install --user oelint-adv`)

**requires** `bitbake` language support installed in vscode

## Usage

- Install the extension and the tool
- Open any `bitbake` document
- On every saving operation the linter will be executed

## Configuration

| key                            | type          | default | description                                  |
| ------------------------------ | ------------- | ------- | -------------------------------------------- |
| oelint-vscode.run.cache-path   | string        | ''      | Custom path to local caches                  |
| oelint-vscode.run.cached       | boolean       | true    | run with local caches                        |
| oelint-vscode.run.constantfile | string        | ''      | Path to constant file                        |
| oelint-vscode.run.fix          | boolean       | false   | Automatically resolve fixable issues         |
| oelint-vscode.run.nobackup     | boolean       | true    | Don't create backups files while auto fixing |
| oelint-vscode.run.noinfo       | boolean       | false   | No info level issues                         |
| oelint-vscode.run.nowarn       | boolean       | false   | No warning level issues                      |
| oelint-vscode.run.rules.custom | array[string] | []      | Additional paths to search for custom rules  |
| oelint-vscode.run.rules.nonstd | array[string] | []      | Additional non-standard rulesets to load     |
| oelint-vscode.run.suppress     | array[string] | []      | Error IDs to suppress automatically          |
| oelint-vscode.update.auto      | boolean       | true    | Automatically update oelint-adv tool         |
| oelint-vscode.update.user      | boolean       | true    | Update with --user switch                    |
