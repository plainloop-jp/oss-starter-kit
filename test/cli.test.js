import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL("../src/cli.js", import.meta.url));
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

test("--version matches the package version", async () => {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, "--version"]);

  assert.equal(stdout.trim(), packageJson.version);
});

test("CLI init writes starter files", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-cli-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init", projectPath]);

  assert.match(stdout, /OSS Starter Kit/);
  assert.match(await readFile(join(projectPath, "CONTRIBUTING.md"), "utf8"), /Contributing/);
});

test("CLI dry run supports JSON output", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-cli-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "init",
    projectPath,
    "--dry-run",
    "--json"
  ]);
  const report = JSON.parse(stdout);

  assert.equal(report.dryRun, true);
  assert.equal(report.results[0].status, "would-create");
});

test("CLI init supports --only", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-cli-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "init",
    projectPath,
    "--only",
    "security,contributing"
  ]);

  assert.match(stdout, /\[CREATED\] SECURITY\.md/);
  assert.match(stdout, /\[CREATED\] CONTRIBUTING\.md/);
  assert.doesNotMatch(stdout, /CODE_OF_CONDUCT\.md/);
  assert.match(await readFile(join(projectPath, "SECURITY.md"), "utf8"), /Security Policy/);
  await assert.rejects(() => readFile(join(projectPath, "CODE_OF_CONDUCT.md"), "utf8"));
});
