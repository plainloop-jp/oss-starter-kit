import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const FILES = [
  {
    id: "contributing",
    aliases: ["contributing.md"],
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
    id: "security",
    aliases: ["security.md"],
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
    id: "code-of-conduct",
    aliases: ["code-of-conduct.md", "conduct"],
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
    id: "pull-request-template",
    aliases: ["pr-template", "pull-request", "pull-request-template.md"],
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
    id: "bug-report",
    aliases: ["bug", "bug-report.yml"],
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
    id: "feature-request",
    aliases: ["feature", "feature-request.yml"],
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
    id: "issue-config",
    aliases: ["config", "issue-template-config", "config.yml"],
    path: ".github/ISSUE_TEMPLATE/config.yml",
    content: `blank_issues_enabled: true
`
  }
];

function normalizeOnlyList(only) {
  if (only === undefined || only === null) {
    return null;
  }

  const values = Array.isArray(only) ? only : String(only).split(",");
  const requested = values.map((value) => value.trim().toLowerCase()).filter(Boolean);

  if (requested.length === 0) {
    throw new Error("The --only option needs at least one starter file name.");
  }

  const fileByName = new Map();

  for (const file of FILES) {
    fileByName.set(file.id, file);
    for (const alias of file.aliases) {
      fileByName.set(alias, file);
    }
  }

  const selected = [];
  const unknown = [];

  for (const name of requested) {
    const file = fileByName.get(name);

    if (!file) {
      unknown.push(name);
      continue;
    }

    if (!selected.includes(file)) {
      selected.push(file);
    }
  }

  if (unknown.length > 0) {
    const available = FILES.map((file) => file.id).join(", ");
    throw new Error(
      `Unknown starter file name: ${unknown.join(", ")}. Available names: ${available}.`
    );
  }

  return selected;
}

export function getStarterFiles() {
  return FILES.map((file) => ({ ...file }));
}

export async function createStarterKit(path = ".", options = {}) {
  const root = resolve(path);
  const dryRun = Boolean(options.dryRun);
  const files = normalizeOnlyList(options.only) ?? FILES;
  const results = [];

  for (const file of files) {
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
