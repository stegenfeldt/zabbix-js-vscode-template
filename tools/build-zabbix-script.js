var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "..");
var sourcePath = path.join(root, "script.js");
var outputPath = path.join(root, "script.zabbix.js");

function removeNodeExportBlock(source) {
  return source.replace(/\n\/\/ Export for local Node\.js harness debug runs\.[\s\S]*module\.exports\s*=\s*zabbixScript;\n}\s*$/m, "\n");
}

function buildOutput(source) {
  var cleaned = removeNodeExportBlock(source).trim();
  return [
    "// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.",
    "// Source: script.js",
    cleaned,
    "",
    "// Zabbix entrypoint call",
    "return zabbixScript(value);",
    ""
  ].join("\n");
}

function main() {
  var source;
  var output;

  source = fs.readFileSync(sourcePath, "utf8");
  output = buildOutput(source);

  fs.writeFileSync(outputPath, output, "utf8");
  process.stdout.write("Generated script.zabbix.js from script.js\n");
}

main();
