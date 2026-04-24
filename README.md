# Zabbix JS Template Project

Template repository for developing JavaScript used in Zabbix preprocessors, script items, and webhook mediatypes.

## Goals
- Fast local debug loop in VS Code.
- Keep scripts compatible with Zabbix runtime expectations (ES5-oriented, synchronous `HttpRequest`).
- Keep repository clean and safe for sharing.

## Repository Layout
- `script.js`: Main Zabbix-compatible script under development.
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

## Runtime Modes
- `preprocessor`: Expects `value` as string.
- `script-item`: Typically receives a JSON string in `value`.
- `webhook`: Usually receives JSON-like payload in `value`.

The harness shapes input per mode and passes `value` into your script function.

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
