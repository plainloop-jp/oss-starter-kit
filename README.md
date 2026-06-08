# OSS Starter Kit

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A small command-line tool that creates starter files for open-source projects.

It pairs well with
[OSS Readiness Checker](https://github.com/plainloop-jp/oss-readiness-checker):
check what is missing, then generate a practical starter set.

## Quick start

Run this command in the root folder of your project:

```sh
npx oss-starter-kit init .
```

Windows PowerShell:

```powershell
npx.cmd oss-starter-kit init .
```

## Example output

When starter files are created, the output looks like this:

```text
OSS Starter Kit
Project: /path/to/your-project

[CREATED] CONTRIBUTING.md
[CREATED] SECURITY.md
[CREATED] CODE_OF_CONDUCT.md
[CREATED] .github/pull_request_template.md
[CREATED] .github/ISSUE_TEMPLATE/bug-report.yml
[CREATED] .github/ISSUE_TEMPLATE/feature-request.yml
[CREATED] .github/ISSUE_TEMPLATE/config.yml
```

Existing files are never overwritten. If a file already exists, it is shown as
`[SKIPPED]`.

## 日本語で試す

OSS として公開するときによく必要になるファイルをまとめて作るCLIツールです。
既にあるファイルは上書きせず、スキップします。

Windows の PowerShell:

```powershell
npx.cmd oss-starter-kit init .
```

macOS または Linux:

```sh
npx oss-starter-kit init .
```

## What it creates

- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug-report.yml`
- `.github/ISSUE_TEMPLATE/feature-request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`

## Requirements

- Node.js 20 or later

## Usage

Create starter files in the current folder:

```sh
npx oss-starter-kit init .
```

Preview what would be created:

```sh
npx oss-starter-kit init . --dry-run
```

Output machine-readable JSON:

```sh
npx oss-starter-kit init . --dry-run --json
```

Create only selected starter files:

```sh
npx oss-starter-kit init . --only security,contributing
```

Available names for `--only`:

- `contributing`
- `security`
- `code-of-conduct`
- `pull-request-template`
- `bug-report`
- `feature-request`
- `issue-config`

Existing files are never overwritten.

## Development

Run the local source code:

```sh
node ./src/cli.js init . --dry-run
```

Run the tests:

```sh
npm test
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

For security reports, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
