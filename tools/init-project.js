var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

var root = path.resolve(__dirname, "..");
var paramsExamplePath = path.join(root, "params.example.json");
var paramsPath = path.join(root, "params.json");

function compareVersion(minVersion, actualVersion) {
  var minParts = minVersion.split(".");
  var actualParts = actualVersion.split(".");
  var i;
  var min;
  var actual;

  for (i = 0; i < 3; i += 1) {
    min = parseInt(minParts[i] || "0", 10);
    actual = parseInt(actualParts[i] || "0", 10);

    if (actual > min) {
      return 1;
    }
    if (actual < min) {
      return -1;
    }
  }

  return 0;
}

function ensureParamsFile() {
  if (fs.existsSync(paramsPath)) {
    process.stdout.write("params.json already exists. Keeping current file.\n");
    return;
  }

  fs.copyFileSync(paramsExamplePath, paramsPath);
  process.stdout.write("Created params.json from params.example.json\n");
}

function checkNodeVersion() {
  var current = process.versions.node;
  var minimum = "18.0.0";

  if (compareVersion(minimum, current) < 0) {
    process.stderr.write("Node.js " + minimum + "+ is recommended. Current: " + current + "\n");
    return false;
  }

  process.stdout.write("Node.js version OK: " + current + "\n");
  return true;
}

function checkCurl() {
  var result = childProcess.spawnSync("curl", ["--version"], { encoding: "utf8" });

  if (result.error || result.status !== 0) {
    process.stderr.write("curl not found in PATH. Install curl for HttpRequest emulation.\n");
    return false;
  }

  process.stdout.write("curl is available.\n");
  return true;
}

function printNextSteps() {
  process.stdout.write("\nNext steps:\n");
  process.stdout.write("1. Review and edit params.json\n");
  process.stdout.write("2. Run npm run debug:script-item\n");
  process.stdout.write("3. Run npm run build:zabbix\n");
}

function main() {
  var okNode;
  var okCurl;

  ensureParamsFile();
  okNode = checkNodeVersion();
  okCurl = checkCurl();
  printNextSteps();

  if (!okNode || !okCurl) {
    process.exitCode = 1;
  }
}

main();
