import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createStarterKit, getStarterFiles } from "../src/starter.js";

test("creates the starter files", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const report = await createStarterKit(projectPath);

  assert.equal(report.results.length, getStarterFiles().length);
  assert.deepEqual(new Set(report.results.map((result) => result.status)), new Set(["created"]));

  for (const file of getStarterFiles()) {
    const content = await readFile(join(projectPath, file.path), "utf8");
    assert.equal(content, file.content);
  }
});

test("does not overwrite existing files", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));
  await writeFile(join(projectPath, "SECURITY.md"), "custom security policy");

  const report = await createStarterKit(projectPath);

  assert.equal(report.results.find((result) => result.path === "SECURITY.md").status, "skipped");
  assert.equal(await readFile(join(projectPath, "SECURITY.md"), "utf8"), "custom security policy");
});

test("dry run reports files without writing them", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const report = await createStarterKit(projectPath, { dryRun: true });

  assert.deepEqual(
    new Set(report.results.map((result) => result.status)),
    new Set(["would-create"])
  );
  await assert.rejects(() => readFile(join(projectPath, "CONTRIBUTING.md"), "utf8"));
});

test("creates only selected starter files", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  const report = await createStarterKit(projectPath, {
    only: "security,contributing"
  });

  assert.deepEqual(
    report.results.map((result) => result.path),
    ["SECURITY.md", "CONTRIBUTING.md"]
  );
  assert.match(await readFile(join(projectPath, "SECURITY.md"), "utf8"), /Security Policy/);
  assert.match(await readFile(join(projectPath, "CONTRIBUTING.md"), "utf8"), /Contributing/);
  await assert.rejects(() => readFile(join(projectPath, "CODE_OF_CONDUCT.md"), "utf8"));
});

test("rejects unknown starter file names", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));

  await assert.rejects(
    () => createStarterKit(projectPath, { only: "security,unknown-file" }),
    /Unknown starter file name: unknown-file/
  );
});

test("creates nested directories when needed", async (context) => {
  const projectPath = await mkdtemp(join(tmpdir(), "oss-starter-kit-"));
  context.after(() => rm(projectPath, { recursive: true, force: true }));
  await mkdir(join(projectPath, ".github"), { recursive: true });

  await createStarterKit(projectPath);

  const template = await readFile(
    join(projectPath, ".github", "ISSUE_TEMPLATE", "bug-report.yml"),
    "utf8"
  );
  assert.match(template, /Bug report/);
});
