#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { createStarterKit } from "./starter.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

function printHelp() {
  console.log(`OSS Starter Kit

Usage:
  oss-starter-kit init [path] [--dry-run] [--json] [--only <names>]
  oss-starter-kit --help
  oss-starter-kit --version

Examples:
  oss-starter-kit init .
  oss-starter-kit init ../my-project --dry-run
  oss-starter-kit init . --only security,contributing`);
}

function parseArguments(args) {
  if (args.includes("--help") || args.includes("-h")) {
    return { command: "help" };
  }

  if (args.includes("--version") || args.includes("-v")) {
    return { command: "version" };
  }

  let dryRun = false;
  let json = false;
  let only;
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (argument === "--json") {
      json = true;
      continue;
    }

    if (argument === "--only") {
      const value = args[index + 1];

      if (!value || value.startsWith("--")) {
        return { command: "invalid", message: "The --only option needs a comma-separated list." };
      }

      only = value;
      index += 1;
      continue;
    }

    if (argument.startsWith("--only=")) {
      const value = argument.slice("--only=".length);

      if (!value) {
        return { command: "invalid", message: "The --only option needs a comma-separated list." };
      }

      only = value;
      continue;
    }

    if (argument.startsWith("--")) {
      return { command: "invalid", message: `Unknown option: ${argument}` };
    }

    positional.push(argument);
  }

  if (positional[0] !== "init" || positional.length > 2) {
    return { command: "invalid" };
  }

  return { command: "init", path: positional[1] ?? ".", dryRun, json, only };
}

function printReport(report) {
  console.log("OSS Starter Kit");
  console.log(`Project: ${report.projectPath}`);
  if (report.dryRun) {
    console.log("Mode: dry run");
  }
  console.log("");

  for (const result of report.results) {
    const label = result.status.toUpperCase();
    console.log(`[${label}] ${result.path}`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.command === "help") {
    printHelp();
    return;
  }

  if (options.command === "version") {
    console.log(packageJson.version);
    return;
  }

  if (options.command === "invalid") {
    console.error(options.message ?? "Invalid arguments.");
    printHelp();
    process.exitCode = 2;
    return;
  }

  try {
    const report = await createStarterKit(options.path, {
      dryRun: options.dryRun,
      only: options.only
    });

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}

await main();
