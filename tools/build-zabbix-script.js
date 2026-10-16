var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "..");

function removeNodeExportBlock(source) {
  return source.replace(/\n\/\/ Export for local Node\.js harness debug runs\.[\s\S]*$/m, "\n");
}

function parseArgs(argv) {
  var scriptPath;
  var i;

  for (i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--script" && argv[i + 1]) {
      scriptPath = argv[i + 1];
      i += 1;
    }
  }

  return scriptPath ? path.resolve(scriptPath) : null;
}

function listSourcePaths() {
  return fs.readdirSync(root).filter(function (fileName) {
    return /\.js$/.test(fileName) && !/\.zabbix\.js$/.test(fileName);
  }).map(function (fileName) {
    return path.join(root, fileName);
  });
}

function resolveEntrypointName(source) {
  var exportMatch = source.match(/module\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;/);
  var functionMatch = source.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);

  if (exportMatch) {
    return exportMatch[1];
  }

  if (functionMatch) {
    return functionMatch[1];
  }

  return "zabbixScript";
}

function buildOutput(source, sourceName, entrypointName) {
  var cleaned = removeNodeExportBlock(source).trim();
  return [
    "// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.",
    "// Source: " + sourceName,
    cleaned,
    "",
    "// Zabbix entrypoint call",
    "return " + entrypointName + "(value);",
    ""
  ].join("\n");
}

function buildScript(sourcePath) {
  var outputPath = path.join(root, path.basename(sourcePath, ".js") + ".zabbix.js");
  var sourceName = path.basename(sourcePath);
  var source;
  var output;

  source = fs.readFileSync(sourcePath, "utf8");
  output = buildOutput(source, sourceName, resolveEntrypointName(source));

  fs.writeFileSync(outputPath, output, "utf8");
  process.stdout.write("Generated " + path.basename(outputPath) + " from " + sourceName + "\n");
}

function main() {
  var requestedScriptPath = parseArgs(process.argv.slice(2));
  var sourcePaths = requestedScriptPath ? [requestedScriptPath] : listSourcePaths();
  var i;

  if (!sourcePaths.length) {
    throw new Error("No project-root JavaScript scripts found");
  }

  for (i = 0; i < sourcePaths.length; i += 1) {
    buildScript(sourcePaths[i]);
  }
}

main();
