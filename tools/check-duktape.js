var childProcess = require("child_process");
var path = require("path");

function hasDuk() {
  var check = childProcess.spawnSync("duk", ["--help"], { encoding: "utf8" });
  if (check.error) {
    return false;
  }
  return true;
}

function runDuktapeCheck() {
  var scriptPath;
  var result;

  if (!hasDuk()) {
    process.stdout.write("duk not found in PATH. Skipping Duktape compatibility check.\n");
    return 0;
  }

  scriptPath = path.resolve(__dirname, "..", "script.js");
  result = childProcess.spawnSync("duk", [scriptPath], { encoding: "utf8" });

  if (result.error) {
    process.stderr.write("Failed to run duk: " + result.error.message + "\n");
    return 1;
  }

  if (result.status !== 0) {
    process.stderr.write("Duktape check failed.\n");
    if (result.stdout) {
      process.stderr.write(result.stdout + "\n");
    }
    if (result.stderr) {
      process.stderr.write(result.stderr + "\n");
    }
    return result.status;
  }

  process.stdout.write("Duktape check passed for script.js\n");
  return 0;
}

process.exitCode = runDuktapeCheck();
