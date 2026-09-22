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
  var scriptPath = resolveScriptPath();
  var result;

  if (!hasDuk()) {
    process.stdout.write("duk not found in PATH. Skipping Duktape compatibility check.\n");
    return 0;
  }

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

  process.stdout.write("Duktape check passed for " + path.basename(scriptPath) + "\n");
  return 0;
}

function resolveScriptPath() {
  var args = process.argv.slice(2);
  var i;

  for (i = 0; i < args.length; i += 1) {
    if (args[i] === "--script" && args[i + 1]) {
      return path.resolve(args[i + 1]);
    }
  }

  return path.resolve(__dirname, "..", "script.js");
}

process.exitCode = runDuktapeCheck();
