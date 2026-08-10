import { buildSync } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const sourceDirectory = join(repositoryRoot, "src");
const distributionDirectory = join(repositoryRoot, "dist");
const sourceEntry = join(sourceDirectory, "main.ts");
const sourceManifest = join(sourceDirectory, "appsscript.json");
const outputEntry = join(distributionDirectory, "main.js");
const outputManifest = join(distributionDirectory, "appsscript.json");
const exportNamespace = "arcaeaPotential";
const wrapperStartMarker = "/* Apps Script entrypoint wrappers */";
const wrapperEndMarker = "/* End Apps Script entrypoint wrappers */";

// GASから直接呼び出せる関数は、main.tsのexportと一対一で管理する。
const PUBLIC_ENTRYPOINTS = [
    "runSongSync",
    "runNewSongRegistration",
    "runRegisteredSongUpdate",
    "runManualEntryRegistration",
    "runDailyStatisticsUpdate",
    "setupTriggers",
    "onHourlySongSync",
    "onSpreadsheetChange",
    "onDailyTasks",
];

function assertCondition(condition, message) {
    if (!condition) {
        throw new Error(`Build validation failed: ${message}`);
    }
}

function assertEntrypointsMatchSource() {
    const sourceText = readFileSync(sourceEntry, "utf8");
    const sourceEntrypoints = [
        ...sourceText.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm),
    ].map(match => match[1]);

    const sourceEntrypointNames = sourceEntrypoints.join(", ");
    assertCondition(
        JSON.stringify(sourceEntrypoints) === JSON.stringify(PUBLIC_ENTRYPOINTS),
        `PUBLIC_ENTRYPOINTS does not match src/main.ts exports (source: ${sourceEntrypointNames})`
    );
}

function createWrappers() {
    return PUBLIC_ENTRYPOINTS.map(
        entrypoint =>
            `function ${entrypoint}(...args) {\n` +
            `    return ${exportNamespace}.${entrypoint}(...args);\n` +
            "}"
    ).join("\n\n");
}

function resetDistributionDirectory() {
    rmSync(distributionDirectory, { force: true, recursive: true });
    mkdirSync(distributionDirectory, { recursive: true });
}

function buildBundle() {
    const result = buildSync({
        absWorkingDir: repositoryRoot,
        alias: {
            "@": sourceDirectory,
        },
        bundle: true,
        entryPoints: [sourceEntry],
        format: "iife",
        globalName: exportNamespace,
        legalComments: "none",
        outfile: outputEntry,
        platform: "browser",
        sourcemap: false,
        target: "es2019",
        write: false,
    });

    assertCondition(
        result.outputFiles.length === 1,
        "esbuild must produce exactly one main.js output"
    );
    return result.outputFiles[0].text;
}

function writeArtifacts(bundleText) {
    const outputText = [
        bundleText.trimEnd(),
        "",
        wrapperStartMarker,
        createWrappers(),
        wrapperEndMarker,
        "",
    ].join("\n");

    writeFileSync(outputEntry, outputText, "utf8");
    copyFileSync(sourceManifest, outputManifest);
}

function readWrapperNames(mainText) {
    const start = mainText.indexOf(wrapperStartMarker);
    const end = mainText.indexOf(wrapperEndMarker);
    assertCondition(start >= 0 && end > start, "wrapper markers are missing or out of order");

    const wrapperText = mainText.slice(start + wrapperStartMarker.length, end);
    return [...wrapperText.matchAll(/^function\s+([A-Za-z_$][\w$]*)\(\.\.\.args\)\s*\{/gm)].map(
        match => match[1]
    );
}

function inspectArtifacts() {
    assertCondition(existsSync(outputManifest), "dist/appsscript.json is missing");
    assertCondition(existsSync(outputEntry), "dist/main.js is missing");

    JSON.parse(readFileSync(outputManifest, "utf8"));

    const mainText = readFileSync(outputEntry, "utf8");
    const moduleSyntaxLine = mainText
        .split(/\r?\n/)
        .find(line => /^\s*(?:import|export)(?:\s|[{*]|$)/.test(line));
    assertCondition(
        moduleSyntaxLine === undefined,
        "main.js contains an import/export syntax line"
    );
    assertCondition(!mainText.includes("__webpack"), "main.js contains webpack output");

    const wrapperNames = readWrapperNames(mainText);
    assertCondition(
        JSON.stringify(wrapperNames) === JSON.stringify(PUBLIC_ENTRYPOINTS),
        `unexpected Apps Script wrappers: ${wrapperNames.join(", ")}`
    );
}

assertEntrypointsMatchSource();
resetDistributionDirectory();
const bundleText = buildBundle();
writeArtifacts(bundleText);
inspectArtifacts();
