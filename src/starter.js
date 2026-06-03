import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const FILES = [
  {
    path: "CONTRIBUTING.md",
    content: `# Contributing

Thanks for considering a contribution.

## Before opening a pull request

1. Open an issue for larger changes so the idea can be discussed first.
2. Keep each pull request focused on one improvement.
3. Add or update tests when behavior changes.
4. Explain how you checked the change.

## Reporting bugs

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- The command you ran
- Your operating system and tool version
`
  },
  {
    path: "SECURITY.md",
    content: `# Security Policy

## Reporting a vulnerability

Please do not open a public GitHub issue for a security vulnerability.

Send security reports to:

TODO: add a private contact email

Include a clear description, steps to reproduce the issue, and any possible
impact. Please allow time for the report to be reviewed before disclosing it
publicly.
`
  },
  {
    path: "CODE_OF_CONDUCT.md",
    content: `# Code of Conduct

## Our Pledge

We want this project to be a welcoming and respectful place for contributors.

## Expected behavior

- Be respectful of different opinions and experiences.
- Give constructive feedback.
- Keep discussions focused on the project.

## Unacceptable behavior

- Harassment or personal attacks.
- Publishing someone else's private information without permission.
- Any conduct that would reasonably be considered inappropriate in a
  professional setting.

## Reporting

Report concerns to:

TODO: add a private contact email
`
  },
  {
    path: ".github/pull_request_template.md",
    content: `## Summary

Describe what this pull request changes and why.

## Testing

Describe how you checked the change.

## Related issue

Link an issue when applicable, for example: \`Closes #123\`

## Checklist

- [ ] I tested the change locally.
- [ ] I updated the documentation if needed.
- [ ] I kept this pull request focused on one improvement.
`
  },
  {
    path: ".github/ISSUE_TEMPLATE/bug-report.yml",
    content: `name: Bug report
description: Report something that is not working as expected.
title: "[Bug]: "
labels:
  - bug
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug.

        Please do not report security vulnerabilities here. Use SECURITY.md instead.
  - type: textarea
    id: expected
    attributes:
      label: What did you expect to happen?
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: What actually happened?
    validations:
      required: true
  - type: input
    id: command
    attributes:
      label: Command
      description: Paste the command you ran, if applicable.
  - type: input
    id: environment
    attributes:
      label: Environment
      description: Operating system, runtime, and version.
`
  },
  {
    path: ".github/ISSUE_TEMPLATE/feature-request.yml",
    content: `name: Feature request
description: Suggest an improvement or new feature.
title: "[Feature]: "
labels:
  - enhancement
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem would this solve?
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: What would you like to happen?
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Additional context
`
  },
  {
    path: ".github/ISSUE_TEMPLATE/config.yml",
    content: `blank_issues_enabled: true
`
  }
];

export function getStarterFiles() {
  return FILES.map((file) => ({ ...file }));
}

export async function createStarterKit(path = ".", options = {}) {
  const root = resolve(path);
  const dryRun = Boolean(options.dryRun);
  const results = [];

  for (const file of FILES) {
    const filePath = resolve(root, file.path);

    if (dryRun) {
      try {
        await access(filePath);
        results.push({ path: file.path, status: "skipped" });
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
        results.push({ path: file.path, status: "would-create" });
      }
      continue;
    }

    try {
      await writeFile(filePath, file.content, { flag: "wx" });
      results.push({ path: file.path, status: "created" });
    } catch (error) {
      if (error.code === "ENOENT") {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, file.content, { flag: "wx" });
        results.push({ path: file.path, status: "created" });
        continue;
      }

      if (error.code === "EEXIST") {
        results.push({ path: file.path, status: "skipped" });
        continue;
      }

      throw error;
    }
  }

  return {
    projectPath: root,
    dryRun,
    results
  };
}
