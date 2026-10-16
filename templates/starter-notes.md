# Starter Package Notes

This is a minimal offline starter package for developing JavaScript used in Zabbix.
It lets you write and test your script locally before pasting it into Zabbix.

## First-Time Setup

Run these commands once after unzipping:

```
npm install
npm run init
```

`npm run init` creates your local `params.json` from the example file.
Edit `params.json` to match your target URL and expected values.

## Your Day-to-Day Workflow

1. Edit `script.js` or add another project-root `.js` file for a separate Zabbix script.
2. Open the script you want to test in VS Code and start the matching debug configuration. The harness runs the active script, so breakpoints in each script are respected.
3. Test it locally:
   ```
   npm run debug:script-item
   ```
4. When ready, build the Zabbix-ready version:
   ```
   npm run build:zabbix -- --script path/to/your-script.js
   ```
   This creates `<scriptname>.zabbix.js` beside the source script. Copy that file's contents into Zabbix.
5. Repeat the debug and build steps for each project-root script.

Running `npm run build:zabbix` without `--script` builds every project-root
`.js` script and skips generated `.zabbix.js` files.

For `example.js`, create `example.params.json` to give that script its own test
input. If it does not exist, the harness uses the shared `params.json`, then
`params.example.json` as a fallback. Run `npm run lint` to check all project-root
scripts for Zabbix/Duktape ES5 compatibility.

## VS Code Tasks (Recommended)

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), choose
**Tasks: Run Task**, and pick from the list. Each task has a description
explaining what it does.

## Key Files

| File | Purpose |
|------|---------|
| `script.js` or other root `.js` files | Your Zabbix scripts - edit these |
| `<scriptname>.params.json` | Test inputs for one script - never commit this |
| `params.json` | Your local test inputs - never commit this |
| `params.example.json` | Safe example inputs - commit this |
| `<scriptname>.zabbix.js` | Auto-generated from one script - paste this into Zabbix |

## Update This README

Replace the template README with information about your project, including its
purpose, script files, expected inputs, deployment steps, and any Zabbix-specific
configuration that another developer will need.

## Important Notes

- `params.json` is not included in this package - create it via `npm run init`.
- Never commit `params.json` - it may contain tokens or credentials.
- `<scriptname>.zabbix.js` files are auto-generated - do not edit them directly.
- Zabbix runs ES5 JavaScript (Duktape engine) - avoid arrow functions, `let`, `const`, template literals.
- Run `npm run check` before submitting your script to catch compatibility issues.