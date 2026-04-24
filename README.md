# Zabbix JS Template Project

Template repository for developing JavaScript used in Zabbix preprocessors, script items, and webhook mediatypes.

## Goals
- Fast local debug loop in VS Code.
- Keep scripts compatible with Zabbix runtime expectations (ES5-oriented, synchronous `HttpRequest`).
- Keep repository clean and safe for sharing.

## Repository Layout
- `script.js`: Main Zabbix-compatible script under development.
- `script.zabbix.js`: Auto-generated file to paste into Zabbix UI.
- `params.example.json`: Committed example of local input parameters.
- `params.json`: Local runtime parameters (ignored by git).
- `harness/`: Local runtime harness and Zabbix global emulation.
- `tools/`: Compatibility and safety checks.
- `agent-memory.md`: Canonical handoff notes for agents.
- `todo.md`: Shared deferred action list.

## Quick Start
1. Install dependencies:
   - `npm install`
2. Create local params from example:
   - Copy `params.example.json` to `params.json`
3. Run default debug harness:
   - `npm run debug`
4. Run by context:
   - `npm run debug:preprocessor`
   - `npm run debug:script-item`
   - `npm run debug:webhook`
5. Generate Zabbix-ready script:
  - `npm run build:zabbix`

## VS Code Debugging
Use the launch configuration `Debug script.js via harness`.

Breakpoints set in `script.js` remain stable because the debug target stays fixed at `harness/run.js` and loads `script.js` from the same path each run.

## Compatibility And Safety Checks
- Lint for ES5-oriented syntax and restricted globals:
  - `npm run lint`
- Optional Duktape check (auto-skips if `duk` is unavailable):
  - `npm run check:duktape`
- Lightweight secret scan for tracked files:
  - `npm run scan:secrets`
- Run all checks:
  - `npm run check`

## Script Contract
- Keep main logic in `script.js`.
- Script can export a function for local harness usage while staying usable in Zabbix.
- Harness injects `Zabbix`, `HttpRequest`, and `console` aliases.

### Current Example Contract
`params.json` is expected to contain:
- `url`: target URL
- `expectedStatusCode`: desired HTTP status for validation/logging
- `searchText`: text that should exist in response body

The example `script.js` returns a JSON string with:
- `url`
- `statusCode`
- `searchStringFound` (boolean)

The script still demonstrates `HttpRequest.addHeader()` usage.

## How The Example Script Works
1. Parse the incoming JSON string (`value`) into an object.
2. Read `url`, `expectedStatusCode`, and `searchText`.
3. Create `HttpRequest` and add a header with `HttpRequest.addHeader()`.
4. Run a blocking `GET` request.
5. Compare real status code with `expectedStatusCode` and log a warning if different.
6. Check if `searchText` exists in response body.
7. Return a JSON string with `url`, `statusCode`, and `searchStringFound`.

## What To Copy Into Zabbix
When you are done developing locally, run `npm run build:zabbix` and copy the content of `script.zabbix.js` into the Zabbix script field.

This is the recommended beginner workflow because it avoids manual edits.

### Why this generated file exists
- `script.js` includes a Node.js export block for local debugging.
- Zabbix does not need that export block.
- The generator removes the Node-specific block and appends a Zabbix-style final line:
  - `return zabbixScript(value);`

For Zabbix UI usage:
1. Keep the function `zabbixScript(value)` and its logic.
2. Keep any `Zabbix.log(...)` and `HttpRequest` usage.
3. Remove the Node.js export block at the end:
   - `if (typeof module !== "undefined" && module.exports) { module.exports = zabbixScript; }`

This export block exists only so local debug harness can `require()` the script.

### Minimal Zabbix-ready shape
```javascript
function zabbixScript(value) {
  // your logic
  return "...";
}

return zabbixScript(value);
```

In many Zabbix contexts, using `return zabbixScript(value);` as the last line is a clear and reliable pattern.

## Runtime Modes
- `preprocessor`: Expects `value` as string.
- `script-item`: Typically receives a JSON string in `value`.
- `webhook`: Usually receives JSON-like payload in `value`.

The harness shapes input per mode and passes `value` into your script function. If `params.value` is not set, the harness automatically builds the input JSON from `url`, `expectedStatusCode`, and `searchText`.

## Cross-Platform Notes
- macOS/Linux: `curl` is typically available by default.
- Windows: Ensure `curl` is available in PATH (native or via Git Bash/WSL).
- The harness uses process execution with argument arrays, avoiding shell quoting pitfalls.

## Sensitive Data Hygiene
- Never commit `params.json`.
- Put real tokens only in local `params.json`.
- Run `npm run scan:secrets` before commits.

## Agent Workflow
- New agents should read `agent-memory.md` and files in `agent-directory/` first.
- Keep `agent-memory.md` updated with decisions and learned runtime behavior.
