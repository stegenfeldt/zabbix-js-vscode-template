var fs = require("fs");
var path = require("path");
var globals = require("./zabbix-globals");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveParamsPath() {
  var root = path.resolve(__dirname, "..");
  var custom = process.env.ZABBIX_PARAMS_FILE;
  var paramsPath;

  if (custom) {
    return path.resolve(root, custom);
  }

  paramsPath = path.join(root, "params.json");
  if (fs.existsSync(paramsPath)) {
    return paramsPath;
  }

  return path.join(root, "params.example.json");
}

function parseArgs(argv) {
  var mode = "script-item";
  var i;

  for (i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--mode" && argv[i + 1]) {
      mode = argv[i + 1];
      i += 1;
    }
  }

  return { mode: mode };
}

function shapeValue(mode, params) {
  var normalized = params;

  if (mode === "preprocessor") {
    if (params && typeof params === "object" && Object.prototype.hasOwnProperty.call(params, "value")) {
      return params.value;
    }

    return params;
  }

  if (mode === "script-item" || mode === "webhook") {
    if (typeof normalized === "string") {
      try {
        normalized = JSON.parse(normalized);
      } catch (error) {
        // Plain string input is allowed for developer-defined handling in script.js.
        return normalized;
      }
    }

    if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) {
      throw new Error(mode + " mode expects a JSON object or a stringified JSON object");
    }

    return normalized;
  }

  throw new Error("Unsupported mode: " + mode);
}

function loadScript(scriptPath) {
  delete require.cache[require.resolve(scriptPath)];
  return require(scriptPath);
}

function run() {
  var options = parseArgs(process.argv.slice(2));
  var root = path.resolve(__dirname, "..");
  var paramsPath = resolveParamsPath();
  var params = readJson(paramsPath);
  var scriptPath = path.join(root, "script.js");
  var scriptFn;
  var value;
  var output;

  globals.installGlobals({ logLevel: params.logLevel || 4 });

  scriptFn = loadScript(scriptPath);
  if (typeof scriptFn !== "function") {
    throw new Error("script.js must export a function for local harness execution");
  }

  value = shapeValue(options.mode, params);
  output = scriptFn(value);

  process.stdout.write("\n=== Harness Output ===\n");
  process.stdout.write(String(output) + "\n");
}

try {
  run();
} catch (error) {
  process.stderr.write("Harness error: " + (error && error.message ? error.message : String(error)) + "\n");
  process.exitCode = 1;
}
