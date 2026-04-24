var childProcess = require("child_process");

function runStep(name, command, args, env) {
  var mergedEnv = Object.assign({}, process.env, env || {});
  var result;

  process.stdout.write("\n== " + name + " ==\n");
  result = childProcess.spawnSync(command, args, {
    stdio: "inherit",
    env: mergedEnv,
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exitCode = result.status;
    return false;
  }

  return true;
}

function main() {
  var steps = [
    {
      name: "Lint",
      command: "npm",
      args: ["run", "lint"]
    },
    {
      name: "Debug script-item with params.example.json",
      command: "npm",
      args: ["run", "debug:script-item"],
      env: { ZABBIX_PARAMS_FILE: "params.example.json" }
    },
    {
      name: "Build Zabbix deploy file",
      command: "npm",
      args: ["run", "build:zabbix"]
    },
    {
      name: "Secret scan",
      command: "npm",
      args: ["run", "scan:secrets"]
    },
    {
      name: "Optional Duktape check",
      command: "npm",
      args: ["run", "check:duktape"]
    }
  ];
  var i;
  var ok;

  for (i = 0; i < steps.length; i += 1) {
    ok = runStep(steps[i].name, steps[i].command, steps[i].args, steps[i].env);
    if (!ok) {
      break;
    }
  }

  if (process.exitCode && process.exitCode !== 0) {
    process.stderr.write("\ndev:check failed.\n");
  } else {
    process.stdout.write("\ndev:check passed.\n");
  }
}

main();
