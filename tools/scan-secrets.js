var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var IGNORE_DIRS = {
  ".git": true,
  "node_modules": true,
  "coverage": true,
  "out": true,
  ".tmp": true
};

var IGNORE_FILES = {
  "params.example.json": true,
  "agent-directory/plan.md": true,
  "agent-directory/preferences.md": true,
  "agent-directory/references.md": true
};

var RULES = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Generic API key assignment", regex: /(api[_-]?key|token|secret|password)\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: "Private key block", regex: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/ },
  { name: "GitHub token", regex: /ghp_[A-Za-z0-9]{36}/ }
];

function listFiles(dir, collected) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  var i;
  var entry;
  var fullPath;
  var relPath;

  for (i = 0; i < entries.length; i += 1) {
    entry = entries[i];
    fullPath = path.join(dir, entry.name);
    relPath = path.relative(ROOT, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS[entry.name]) {
        listFiles(fullPath, collected);
      }
      continue;
    }

    if (!IGNORE_FILES[relPath] && !IGNORE_FILES[entry.name]) {
      collected.push(fullPath);
    }
  }
}

function isProbablyText(buffer) {
  var i;
  var sampleLength = Math.min(buffer.length, 2048);

  for (i = 0; i < sampleLength; i += 1) {
    if (buffer[i] === 0) {
      return false;
    }
  }

  return true;
}

function scanFile(filePath) {
  var relPath = path.relative(ROOT, filePath).replace(/\\/g, "/");
  var raw = fs.readFileSync(filePath);
  var content;
  var findings = [];
  var i;

  if (!isProbablyText(raw)) {
    return findings;
  }

  content = raw.toString("utf8");

  for (i = 0; i < RULES.length; i += 1) {
    if (RULES[i].regex.test(content)) {
      findings.push({
        file: relPath,
        rule: RULES[i].name
      });
    }
  }

  return findings;
}

function main() {
  var files = [];
  var allFindings = [];
  var i;
  var fileFindings;

  listFiles(ROOT, files);

  for (i = 0; i < files.length; i += 1) {
    fileFindings = scanFile(files[i]);
    if (fileFindings.length) {
      allFindings = allFindings.concat(fileFindings);
    }
  }

  if (!allFindings.length) {
    process.stdout.write("No obvious secrets detected.\n");
    return 0;
  }

  process.stderr.write("Potential secrets detected:\n");
  for (i = 0; i < allFindings.length; i += 1) {
    process.stderr.write("- " + allFindings[i].file + " :: " + allFindings[i].rule + "\n");
  }

  return 1;
}

process.exitCode = main();
