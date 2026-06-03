#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { createStarterKit } from "./starter.js";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

function printHelp() {
  console.log(`OSS Starter Kit

Usage:
  oss-starter-kit init [path] [--dry-run] [--json]
  oss-starter-kit --help
  oss-starter-kit --version

Examples:
  oss-starter-kit init .
  oss-starter-kit init ../my-project --dry-run`);
}

function parseArguments(args) {
  if (args.includes("--help") || args.includes("-h")) {
    return { command: "help" };
  }

  if (args.includes("--version") || args.includes("-v")) {
    return { command: "version" };
  }

  const dryRun = args.includes("--dry-run");
  const json = args.includes("--json");
  const positional = args.filter((argument) => !["--dry-run", "--json"].includes(argument));

  if (positional[0] !== "init" || positional.length > 2) {
    return { command: "invalid" };
  }

  return { command: "init", path: positional[1] ?? ".", dryRun, json };
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
    console.error("Invalid arguments.");
    printHelp();
    process.exitCode = 2;
    return;
  }

  try {
    const report = await createStarterKit(options.path, {
      dryRun: options.dryRun
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
