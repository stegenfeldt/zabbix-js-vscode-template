var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

var root = path.resolve(__dirname, "..");
var distDir = path.join(root, "dist");
var starterDir = path.join(distDir, "starter-package");
var zipPath = path.join(distDir, "zabbix-js-starter.zip");
var starterNotesTemplatePath = path.join(root, "templates", "starter-notes.md");

var essentialFiles = [
  ".gitignore",
  "package.json",
  "script.js",
  "params.example.json",
  "harness/run.js",
  "harness/zabbix-globals.js",
  "harness/HttpRequest.js",
  "tools/init-project.js",
  "tools/build-zabbix-script.js",
  "tools/check-duktape.js",
  "tools/dev-check.js",
  "tools/scan-secrets.js",
  ".vscode/launch.json",
  ".vscode/tasks.json",
  ".eslintrc.cjs"
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyEssentialFiles() {
  var i;
  var sourcePath;
  var targetPath;

  for (i = 0; i < essentialFiles.length; i += 1) {
    sourcePath = path.join(root, essentialFiles[i]);
    targetPath = path.join(starterDir, essentialFiles[i]);

    if (!fs.existsSync(sourcePath)) {
      throw new Error("Required file not found: " + essentialFiles[i]);
    }

    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function writeStarterReadme() {
  var notes = fs.readFileSync(starterNotesTemplatePath, "utf8");

  fs.writeFileSync(path.join(starterDir, "README.md"), notes, "utf8");
}

function zipStarterDirectory() {
  var result;

  result = childProcess.spawnSync("zip", ["-rq", zipPath, "."], {
    cwd: starterDir,
    encoding: "utf8"
  });

  if (result.error || result.status !== 0) {
    process.stdout.write("Starter folder created at dist/starter-package\n");
    process.stdout.write("zip command not available. Zip file was not created.\n");
    return;
  }

  process.stdout.write("Starter folder created at dist/starter-package\n");
  process.stdout.write("Starter zip created at dist/zabbix-js-starter.zip\n");
}

function main() {
  fs.rmSync(starterDir, { recursive: true, force: true });
  fs.rmSync(zipPath, { force: true });
  ensureDir(starterDir);

  copyEssentialFiles();
  writeStarterReadme();
  zipStarterDirectory();
}

main();
